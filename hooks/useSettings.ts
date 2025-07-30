"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"

interface UserSettings {
  // Conta
  username: string
  email: string
  phone: string
  
  // Perfil
  full_name: string
  bio: string
  location: string
  website: string
  birth_date: string
  
  // Privacidade
  profile_visibility: 'public' | 'friends' | 'private'
  show_online_status: boolean
  show_last_seen: boolean
  allow_messages_from: 'everyone' | 'friends' | 'verified' | 'none'
  show_activity_status: boolean
  
  // Notificações
  email_notifications: boolean
  push_notifications: boolean
  notification_likes: boolean
  notification_comments: boolean
  notification_follows: boolean
  notification_messages: boolean
  notification_mentions: boolean
  notification_events: boolean
  notification_communities: boolean
  quiet_hours_enabled: boolean
  quiet_hours_start: string
  quiet_hours_end: string
  
  // Aparência
  theme: 'light' | 'dark' | 'system'
  language: string
  
  // Segurança
  two_factor_enabled: boolean
  login_alerts: boolean
  session_timeout: number
}

interface PasswordChangeData {
  current_password: string
  new_password: string
  confirm_password: string
}

export function useSettings() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<UserSettings>({
    // Valores padrão baseados no usuário atual
    username: user?.username || "",
    email: user?.email || "",
    phone: "",
    
    full_name: user?.full_name || "",
    bio: user?.bio || "",
    location: user?.location || "",
    website: user?.website || "",
    birth_date: user?.birth_date || "",
    
    profile_visibility: "public",
    show_online_status: true,
    show_last_seen: true,
    allow_messages_from: "everyone",
    show_activity_status: true,
    
    email_notifications: true,
    push_notifications: true,
    notification_likes: true,
    notification_comments: true,
    notification_follows: true,
    notification_messages: true,
    notification_mentions: true,
    notification_events: true,
    notification_communities: true,
    quiet_hours_enabled: false,
    quiet_hours_start: "22:00",
    quiet_hours_end: "08:00",
    
    theme: "system",
    language: "pt-BR",
    
    two_factor_enabled: false,
    login_alerts: true,
    session_timeout: 30,
  })
  
  const [loading, setLoading] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  // Carregar configurações do usuário
  useEffect(() => {
    if (user) {
      loadUserSettings()
    }
  }, [user])

  const loadUserSettings = async () => {
    try {
      // TODO: Implementar chamada real para API
      // const response = await fetch('/api/settings')
      // const data = await response.json()
      
      // Por enquanto, usar dados do usuário atual
      setSettings(prev => ({
        ...prev,
        username: user?.username || "",
        email: user?.email || "",
        full_name: user?.full_name || "",
        bio: user?.bio || "",
        location: user?.location || "",
        website: user?.website || "",
        birth_date: user?.birth_date || "",
      }))
    } catch (error) {
      console.error("Error loading settings:", error)
      toast.error("Erro ao carregar configurações")
    }
  }

  const updateSetting = <K extends keyof UserSettings>(
    key: K, 
    value: UserSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setIsDirty(true)
  }

  const saveSettings = async (section?: string) => {
    setLoading(true)
    try {
      // TODO: Implementar salvamento real
      // const response = await fetch('/api/settings', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(settings)
      // })
      
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setIsDirty(false)
      toast.success(`Configurações ${section ? `de ${section}` : ''} salvas com sucesso!`)
      return { success: true }
    } catch (error) {
      console.error("Error saving settings:", error)
      toast.error("Erro ao salvar configurações")
      return { success: false, error: "Erro ao salvar configurações" }
    } finally {
      setLoading(false)
    }
  }

  const changePassword = async (data: PasswordChangeData) => {
    if (data.new_password !== data.confirm_password) {
      toast.error("As senhas não coincidem")
      return { success: false, error: "As senhas não coincidem" }
    }

    if (data.new_password.length < 8) {
      toast.error("A senha deve ter pelo menos 8 caracteres")
      return { success: false, error: "A senha deve ter pelo menos 8 caracteres" }
    }

    setLoading(true)
    try {
      // TODO: Implementar mudança de senha real
      // const response = await fetch('/api/auth/change-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // })
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success("Senha alterada com sucesso!")
      return { success: true }
    } catch (error) {
      console.error("Error changing password:", error)
      toast.error("Erro ao alterar senha")
      return { success: false, error: "Erro ao alterar senha" }
    } finally {
      setLoading(false)
    }
  }

  const enable2FA = async () => {
    setLoading(true)
    try {
      // TODO: Implementar habilitação de 2FA real
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      updateSetting('two_factor_enabled', true)
      toast.success("Autenticação de dois fatores habilitada!")
      return { success: true }
    } catch (error) {
      console.error("Error enabling 2FA:", error)
      toast.error("Erro ao habilitar 2FA")
      return { success: false, error: "Erro ao habilitar 2FA" }
    } finally {
      setLoading(false)
    }
  }

  const disable2FA = async () => {
    setLoading(true)
    try {
      // TODO: Implementar desabilitação de 2FA real
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      updateSetting('two_factor_enabled', false)
      toast.success("Autenticação de dois fatores desabilitada!")
      return { success: true }
    } catch (error) {
      console.error("Error disabling 2FA:", error)
      toast.error("Erro ao desabilitar 2FA")
      return { success: false, error: "Erro ao desabilitar 2FA" }
    } finally {
      setLoading(false)
    }
  }

  const requestEmailVerification = async () => {
    setLoading(true)
    try {
      // TODO: Implementar envio de verificação de email
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success("Email de verificação enviado!")
      return { success: true }
    } catch (error) {
      console.error("Error sending verification email:", error)
      toast.error("Erro ao enviar email de verificação")
      return { success: false, error: "Erro ao enviar email de verificação" }
    } finally {
      setLoading(false)
    }
  }

  const deactivateAccount = async () => {
    setLoading(true)
    try {
      // TODO: Implementar desativação de conta
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success("Conta desativada temporariamente")
      return { success: true }
    } catch (error) {
      console.error("Error deactivating account:", error)
      toast.error("Erro ao desativar conta")
      return { success: false, error: "Erro ao desativar conta" }
    } finally {
      setLoading(false)
    }
  }

  const deleteAccount = async () => {
    setLoading(true)
    try {
      // TODO: Implementar exclusão de conta
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success("Conta excluída permanentemente")
      return { success: true }
    } catch (error) {
      console.error("Error deleting account:", error)
      toast.error("Erro ao excluir conta")
      return { success: false, error: "Erro ao excluir conta" }
    } finally {
      setLoading(false)
    }
  }

  const exportData = async () => {
    setLoading(true)
    try {
      // TODO: Implementar exportação de dados
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simular download de arquivo
      const data = {
        user: user,
        settings: settings,
        exportDate: new Date().toISOString()
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `openlove-data-${user?.username}-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success("Dados exportados com sucesso!")
      return { success: true }
    } catch (error) {
      console.error("Error exporting data:", error)
      toast.error("Erro ao exportar dados")
      return { success: false, error: "Erro ao exportar dados" }
    } finally {
      setLoading(false)
    }
  }

  return {
    settings,
    updateSetting,
    saveSettings,
    changePassword,
    enable2FA,
    disable2FA,
    requestEmailVerification,
    deactivateAccount,
    deleteAccount,
    exportData,
    loading,
    isDirty
  }
}