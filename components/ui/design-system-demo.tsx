"use client"

import { BaseCard } from "./base-card"
import { BaseModal } from "./base-modal"
import { Button } from "./button"
import { Badge } from "./badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs"
import { Crown, Gem, Heart, Zap, Check } from "lucide-react"
import { useState } from "react"

/**
 * Componente de demonstração do Design System do OpenLove
 * Mostra exemplos de uso correto dos componentes base com responsividade
 */
export function DesignSystemDemo() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="space-y-8 p-4 xs:p-6 sm:p-8">
      {/* Exemplo de Cards */}
      <section>
        <h2 className="text-xl xs:text-2xl font-bold mb-4">Cards</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <BaseCard variant="default">
            <h3 className="font-semibold text-base xs:text-lg">Card Padrão</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Este é um card com estilo padrão
            </p>
          </BaseCard>

          <BaseCard variant="glass">
            <h3 className="font-semibold text-base xs:text-lg">Card Glass</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Card com efeito glassmorphism
            </p>
          </BaseCard>

          <BaseCard variant="gradient">
            <h3 className="font-semibold text-base xs:text-lg">Card Gradient</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Card com gradiente sutil
            </p>
          </BaseCard>
        </div>
      </section>

      {/* Exemplo de Botões */}
      <section>
        <h2 className="text-xl xs:text-2xl font-bold mb-4">Botões</h2>
        <div className="flex flex-wrap gap-2 xs:gap-3">
          <Button size="xs">Extra Pequeno</Button>
          <Button size="sm">Pequeno</Button>
          <Button>Padrão</Button>
          <Button size="lg">Grande</Button>
          <Button variant="gradient">
            <Zap className="w-4 h-4" />
            Gradiente
          </Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </section>

      {/* Exemplo de Badges */}
      <section>
        <h2 className="text-xl xs:text-2xl font-bold mb-4">Badges de Planos</h2>
        <div className="flex flex-wrap gap-2 xs:gap-3">
          <Badge variant="outline" className="plan-badge-gold">
            <Crown className="w-3 h-3 mr-1" />
            Gold
          </Badge>
          <Badge variant="outline" className="plan-badge-diamond">
            <Gem className="w-3 h-3 mr-1" />
            Diamond
          </Badge>
          <Badge variant="outline" className="plan-badge-couple">
            <Heart className="w-3 h-3 mr-1" />
            Dupla Hot
          </Badge>
        </div>
      </section>

      {/* Exemplo de Tabs */}
      <section>
        <h2 className="text-xl xs:text-2xl font-bold mb-4">Tabs Responsivas</h2>
        <Tabs defaultValue="para-voce" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="para-voce">Para Você</TabsTrigger>
            <TabsTrigger value="seguindo">Seguindo</TabsTrigger>
            <TabsTrigger value="explorar">Explorar</TabsTrigger>
          </TabsList>
          <TabsContent value="para-voce">
            <BaseCard>
              <p className="text-sm">Conteúdo personalizado para você</p>
            </BaseCard>
          </TabsContent>
          <TabsContent value="seguindo">
            <BaseCard>
              <p className="text-sm">Posts de quem você segue</p>
            </BaseCard>
          </TabsContent>
          <TabsContent value="explorar">
            <BaseCard>
              <p className="text-sm">Descubra novos conteúdos</p>
            </BaseCard>
          </TabsContent>
        </Tabs>
      </section>

      {/* Exemplo de Modal */}
      <section>
        <h2 className="text-xl xs:text-2xl font-bold mb-4">Modal</h2>
        <Button onClick={() => setModalOpen(true)}>Abrir Modal de Exemplo</Button>
        
        <BaseModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Modal Responsivo"
          description="Este modal se adapta perfeitamente a todos os tamanhos de tela"
          size="md"
        >
          <div className="space-y-4">
            <p className="text-sm xs:text-base">
              O design system do OpenLove garante consistência visual em toda a aplicação.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-green-500" />
              <span>Responsivo desde 360px</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-green-500" />
              <span>Componentes reutilizáveis</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-green-500" />
              <span>Dark mode nativo</span>
            </div>
          </div>
        </BaseModal>
      </section>

      {/* Breakpoints Guide */}
      <section>
        <h2 className="text-xl xs:text-2xl font-bold mb-4">Breakpoints</h2>
        <BaseCard variant="bordered">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">xs:</span>
              <span className="text-gray-600 dark:text-gray-400">360px</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">sm:</span>
              <span className="text-gray-600 dark:text-gray-400">640px</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">md:</span>
              <span className="text-gray-600 dark:text-gray-400">768px</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">lg:</span>
              <span className="text-gray-600 dark:text-gray-400">1024px</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">xl:</span>
              <span className="text-gray-600 dark:text-gray-400">1280px</span>
            </div>
          </div>
        </BaseCard>
      </section>
    </div>
  )
}