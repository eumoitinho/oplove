import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

// GET /api/v1/payments/plans - Get available subscription plans
export async function GET(request: NextRequest) {
  try {
    const plans = [
      {
        id: "free",
        name: "Plano Gratuito",
        price: 0,
        currency: "BRL",
        interval: null,
        features: [
          "Criar posts sem mídia",
          "Responder mensagens de usuários premium",
          "Ver perfis públicos",
          "3 fotos/mês no perfil",
        ],
        limitations: [
          "Não pode iniciar conversas",
          "Não pode fazer upload de mídia em posts",
          "Não pode criar eventos",
          "Não pode entrar em comunidades",
          "Vê anúncios a cada 5 posts",
        ],
      },
      {
        id: "gold",
        name: "Plano Gold",
        price: 25.00,
        currency: "BRL",
        interval: "month",
        features: [
          "10 mensagens/dia (sem verificação)",
          "Mensagens ilimitadas (com verificação)",
          "Até 5 imagens por post",
          "Criar 3 eventos/mês (sem verificação)",
          "Eventos ilimitados (com verificação)",
          "Entrar em até 5 comunidades",
          "Vê anúncios a cada 10 posts",
        ],
        limitations: [
          "Não pode criar grupos",
          "Sem chamadas de voz/vídeo",
          "Sem Stories",
          "Não pode monetizar conteúdo",
        ],
      },
      {
        id: "diamond",
        name: "Plano Diamond",
        price: 45.00,
        currency: "BRL",
        interval: "month",
        features: [
          "Tudo ilimitado",
          "Criar grupos (até 50 membros)",
          "Chamadas de voz/vídeo",
          "Stories de 24h",
          "Análises do perfil",
          "Monetização de conteúdo",
          "Sem anúncios",
          "Suporte prioritário",
        ],
        limitations: [],
      },
      {
        id: "couple",
        name: "Plano Casal",
        price: 69.90,
        currency: "BRL",
        interval: "month",
        features: [
          "Todos os recursos Diamond para 2 contas",
          "Perfil compartilhado opcional",
          "Álbum privado do casal",
          "Diário compartilhado",
          "Jogos para casais",
          "Sincronização de atividades",
        ],
        limitations: [],
      },
    ]

    return NextResponse.json({
      data: plans,
      success: true,
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor", success: false },
      { status: 500 }
    )
  }
}