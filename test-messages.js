// Test script to verify message functionality
// Run with: node test-messages.js

const { createClient } = require('@supabase/supabase-js')

// Replace with your Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your-supabase-url'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testMessages() {
  console.log('🧪 Testing OpenLove Messages System\n')
  
  try {
    // 1. Test authentication
    console.log('1️⃣ Testing authentication...')
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('❌ Not authenticated. Please login first.')
      return
    }
    
    console.log('✅ Authenticated as:', user.email)
    
    // 2. Test user data
    console.log('\n2️⃣ Testing user data...')
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, username, name, avatar_url, premium_type, is_verified')
      .eq('id', user.id)
      .single()
    
    if (userError) {
      console.error('❌ Error fetching user data:', userError.message)
      return
    }
    
    console.log('✅ User data:', {
      username: userData.username,
      name: userData.name,
      premium_type: userData.premium_type,
      is_verified: userData.is_verified
    })
    
    // 3. Test conversations
    console.log('\n3️⃣ Testing conversations...')
    const { data: conversations, error: convError } = await supabase
      .from('conversation_participants')
      .select(`
        conversation_id,
        conversations!inner(*)
      `)
      .eq('user_id', user.id)
      .is('left_at', null)
    
    if (convError) {
      console.error('❌ Error fetching conversations:', convError.message)
      return
    }
    
    console.log(`✅ Found ${conversations?.length || 0} conversations`)
    
    if (conversations && conversations.length > 0) {
      const firstConv = conversations[0]
      console.log('   First conversation ID:', firstConv.conversation_id)
      
      // 4. Test messages
      console.log('\n4️⃣ Testing messages...')
      const { data: messages, error: msgError } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!sender_id(id, username, name, avatar_url)
        `)
        .eq('conversation_id', firstConv.conversation_id)
        .order('created_at', { ascending: false })
        .limit(5)
      
      if (msgError) {
        console.error('❌ Error fetching messages:', msgError.message)
        return
      }
      
      console.log(`✅ Found ${messages?.length || 0} recent messages`)
      
      if (messages && messages.length > 0) {
        console.log('   Latest message:')
        console.log('   - From:', messages[0].sender?.name || messages[0].sender?.username || 'Unknown')
        console.log('   - Content:', messages[0].content?.substring(0, 50) || '[Media]')
        console.log('   - Time:', new Date(messages[0].created_at).toLocaleString())
      }
      
      // 5. Test real-time subscription
      console.log('\n5️⃣ Testing real-time subscription...')
      const channel = supabase
        .channel(`messages:${firstConv.conversation_id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${firstConv.conversation_id}`
          },
          (payload) => {
            console.log('📨 New message received:', payload.new)
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('✅ Successfully subscribed to real-time messages')
            console.log('   Waiting 10 seconds for messages...')
            
            setTimeout(() => {
              supabase.removeChannel(channel)
              console.log('\n✅ All tests completed!')
              process.exit(0)
            }, 10000)
          } else {
            console.log('   Subscription status:', status)
          }
        })
    } else {
      console.log('⚠️ No conversations found. Create a conversation first.')
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Run the test
testMessages()