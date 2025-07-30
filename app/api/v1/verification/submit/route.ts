import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { StorageServerService } from "@/lib/services/storage-server.service"
import { z } from "zod"

// Schema for verification data
const verificationSchema = z.object({
  fullName: z.string().min(2),
  cpf: z.string().min(11),
  birthDate: z.string(),
  documentType: z.enum(["rg", "cnh", "passport"]),
  documentNumber: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: "Não autorizado", success: false },
        { status: 401 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    
    // Extract and validate text fields
    const textData = {
      fullName: formData.get('fullName') as string,
      cpf: formData.get('cpf') as string,
      birthDate: formData.get('birthDate') as string,
      documentType: formData.get('documentType') as string,
      documentNumber: formData.get('documentNumber') as string,
    }

    const validatedData = verificationSchema.parse(textData)

    // Extract files
    const documentFront = formData.get('documentFront') as File | null
    const documentBack = formData.get('documentBack') as File | null
    const selfiePhoto = formData.get('selfiePhoto') as File | null
    const faceScanData = formData.get('faceScanData') as string | null

    // Validate required files
    if (!documentFront || !selfiePhoto) {
      return NextResponse.json(
        { error: "Documentos obrigatórios não fornecidos", success: false },
        { status: 400 }
      )
    }

    // Check if user already has a verification in progress
    const { data: existingVerification } = await supabase
      .from('user_verifications')
      .select('id, status')
      .eq('user_id', user.id)
      .single()

    if (existingVerification && existingVerification.status === 'pending') {
      return NextResponse.json(
        { error: "Você já possui uma verificação em andamento", success: false },
        { status: 400 }
      )
    }

    // Upload files using StorageService
    const uploadPromises = []
    const filePaths: any = {}

    // Upload document front
    uploadPromises.push(
      StorageServerService.uploadFile({
        userId: user.id,
        file: documentFront,
        type: 'verification'
      }).then(result => {
        if (result.error) throw new Error(result.error)
        filePaths.documentFront = result.path
        filePaths.documentFrontUrl = result.url
      })
    )

    // Upload document back if provided
    if (documentBack) {
      uploadPromises.push(
        StorageServerService.uploadFile({
          userId: user.id,
          file: documentBack,
          type: 'verification',
          }).then(result => {
          if (result.error) throw new Error(result.error)
          filePaths.documentBack = result.path
          filePaths.documentBackUrl = result.url
        })
      )
    }

    // Upload selfie
    uploadPromises.push(
      StorageServerService.uploadFile({
        userId: user.id,
        file: selfiePhoto,
        type: 'verification'
      }).then(result => {
        if (result.error) throw new Error(result.error)
        filePaths.selfie = result.path
        filePaths.selfieUrl = result.url
      })
    )

    // Wait for all uploads to complete
    await Promise.all(uploadPromises)

    // Parse face scan data
    let parsedFaceScanData = null
    if (faceScanData) {
      try {
        parsedFaceScanData = JSON.parse(faceScanData)
      } catch (error) {
        console.error('Error parsing face scan data:', error)
      }
    }

    // Create verification record
    const { data: verification, error: insertError } = await supabase
      .from('user_verifications')
      .insert({
        user_id: user.id,
        full_name: validatedData.fullName,
        cpf: validatedData.cpf,
        birth_date: validatedData.birthDate,
        document_type: validatedData.documentType,
        document_number: validatedData.documentNumber,
        document_front_url: filePaths.documentFrontUrl,
        document_back_url: filePaths.documentBackUrl || null,
        selfie_url: filePaths.selfieUrl,
        face_scan_data: parsedFaceScanData,
        status: 'pending',
        submitted_at: new Date().toISOString(),
        verification_score: parsedFaceScanData?.livenessScore || 0
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting verification:', insertError)
      return NextResponse.json(
        { error: "Erro ao salvar verificação", success: false },
        { status: 500 }
      )
    }

    // Trigger automated verification process (in background)
    // This would typically call an AI service for document verification
    processVerificationAsync(verification.id)

    // Send notification to admin team
    await notifyAdminTeam(verification.id, user.email)

    return NextResponse.json({
      success: true,
      message: "Verificação enviada com sucesso!",
      data: {
        verificationId: verification.id,
        status: 'pending',
        expectedReviewTime: '48 horas'
      }
    })

  } catch (error) {
    console.error('Verification submission error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos: " + error.errors[0].message, success: false },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Erro interno do servidor", success: false },
      { status: 500 }
    )
  }
}

// Background processing function
async function processVerificationAsync(verificationId: string) {
  try {
    // This would typically:
    // 1. Call document verification API (AWS Textract, Google Vision, etc.)
    // 2. Perform face matching between selfie and document photo
    // 3. Validate document authenticity
    // 4. Check against fraud databases
    
    // For now, simulate processing
    setTimeout(async () => {
      const supabase = createServerClient()
      
      // Simulate automated verification (80% approval rate for demo)
      const isApproved = Math.random() > 0.2
      const score = isApproved ? 85 + Math.random() * 10 : 45 + Math.random() * 20
      
      const { error } = await supabase
        .from('user_verifications')
        .update({
          status: isApproved ? 'approved' : 'manual_review',
          verification_score: score,
          reviewed_at: new Date().toISOString(),
          reviewer_notes: isApproved 
            ? 'Automated verification successful'
            : 'Requires manual review - low confidence score'
        })
        .eq('id', verificationId)

      if (!error && isApproved) {
        // Update user's verification status
        const { data: verification } = await supabase
          .from('user_verifications')
          .select('user_id')
          .eq('id', verificationId)
          .single()

        if (verification) {
          await supabase
            .from('users')
            .update({ 
              is_verified: true,
              verified_at: new Date().toISOString()
            })
            .eq('id', verification.user_id)
        }
      }
    }, 30000) // 30 seconds delay for demo

  } catch (error) {
    console.error('Background verification processing error:', error)
  }
}

// Notification function for admin team
async function notifyAdminTeam(verificationId: string, userEmail: string) {
  try {
    // In production, this would send notifications via email, Slack, etc.
    console.log(`New verification submitted: ${verificationId} for user: ${userEmail}`)
    
    // You could integrate with services like:
    // - SendGrid for email notifications
    // - Slack webhook for team notifications
    // - Discord webhook
    // - Push notifications to admin dashboard
    
  } catch (error) {
    console.error('Error sending admin notification:', error)
  }
}