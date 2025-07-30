import { Metadata } from 'next'
import Link from 'next/link'
import { FileText, Shield, AlertTriangle, Ban, CreditCard, Scale, Users, Heart } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Termos de Uso - OpenLove',
  description: 'Termos de Uso e Condições Gerais da plataforma OpenLove',
}

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <FileText className="w-16 h-16 text-purple-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Termos de Uso
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>

        {/* Important Notice */}
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-red-900 dark:text-red-200 mb-2">
                AVISO IMPORTANTE: PLATAFORMA ADULTA
              </h3>
              <p className="text-red-800 dark:text-red-300">
                A OpenLove é uma plataforma exclusiva para maiores de 18 anos. Ao acessar ou usar nossos 
                serviços, você declara ter pelo menos 18 anos de idade e concorda com todos os termos aqui 
                estabelecidos.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          {/* 1. Aceitação dos Termos */}
          <section className="mb-10">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white mb-4">
              <Scale className="w-6 h-6 text-purple-600" />
              1. Aceitação dos Termos
            </h2>
            
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Ao criar uma conta ou usar a OpenLove, você concorda com estes Termos de Uso, nossa 
              Política de Privacidade e todas as políticas aplicáveis. Se você não concordar com 
              qualquer parte destes termos, não use nossa plataforma.
            </p>
            
            <p className="text-gray-700 dark:text-gray-300">
              Estes termos constituem um contrato legal vinculativo entre você e a OpenLove Tecnologia Ltda., 
              empresa brasileira registrada sob CNPJ [número], com sede em Curitiba, Paraná.
            </p>
          </section>

          {/* 2. Descrição do Serviço */}
          <section className="mb-10">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white mb-4">
              <Heart className="w-6 h-6 text-purple-600" />
              2. Descrição do Serviço
            </h2>
            
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              A OpenLove é uma rede social focada em conexões autênticas e relacionamentos significativos, 
              oferecendo:
            </p>
            
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Perfis de usuários e ferramentas de descoberta</li>
              <li>Sistema de mensagens e comunicação</li>
              <li>Compartilhamento de conteúdo (fotos, vídeos, posts)</li>
              <li>Monetização de conteúdo para criadores</li>
              <li>Eventos e comunidades</li>
              <li>Recursos premium mediante assinatura</li>
            </ul>
          </section>

          {/* 3. Elegibilidade */}
          <section className="mb-10">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white mb-4">
              <Users className="w-6 h-6 text-purple-600" />
              3. Elegibilidade e Cadastro
            </h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">3.1 Requisitos de Idade</h3>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
              <p className="text-gray-700 dark:text-gray-300 font-semibold">
                Você deve ter pelo menos 18 anos para usar a OpenLove. Criamos um processo rigoroso de 
                verificação de idade e qualquer tentativa de burlar essa verificação resultará em banimento 
                permanente e possíveis ações legais.
              </p>
            </div>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">3.2 Informações de Cadastro</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Você concorda em:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Fornecer informações verdadeiras e precisas</li>
              <li>Manter suas informações atualizadas</li>
              <li>Manter a confidencialidade de sua senha</li>
              <li>Notificar-nos sobre uso não autorizado de sua conta</li>
              <li>Ser responsável por toda atividade em sua conta</li>
            </ul>
          </section>

          {/* 4. Regras de Conduta */}
          <section className="mb-10">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white mb-4">
              <Shield className="w-6 h-6 text-purple-600" />
              4. Regras de Conduta e Uso Aceitável
            </h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">4.1 Comportamento Esperado</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Ao usar a OpenLove, você concorda em:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Tratar outros usuários com respeito e dignidade</li>
              <li>Obter consentimento antes de compartilhar conteúdo íntimo</li>
              <li>Respeitar a privacidade e limites dos outros</li>
              <li>Usar a plataforma para conexões genuínas</li>
              <li>Reportar comportamento inadequado</li>
            </ul>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">4.2 Conteúdo Permitido</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              A OpenLove permite conteúdo adulto consensual, desde que:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Todos os participantes sejam maiores de 18 anos</li>
              <li>Seja consensual e legal</li>
              <li>Não viole direitos de terceiros</li>
              <li>Esteja devidamente marcado como conteúdo adulto</li>
            </ul>
          </section>

          {/* 5. Conteúdo Proibido */}
          <section className="mb-10">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white mb-4">
              <Ban className="w-6 h-6 text-red-600" />
              5. Conteúdo e Comportamento Proibidos
            </h2>
            
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <p className="text-red-800 dark:text-red-300 font-semibold">
                Violações resultarão em suspensão ou banimento permanente:
              </p>
            </div>
            
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li className="font-semibold">Qualquer conteúdo envolvendo menores de idade</li>
              <li>Conteúdo não consensual ou de vingança</li>
              <li>Assédio, intimidação ou stalking</li>
              <li>Discurso de ódio ou discriminação</li>
              <li>Violência ou ameaças</li>
              <li>Conteúdo ilegal ou atividades criminosas</li>
              <li>Spam ou comportamento automatizado</li>
              <li>Falsificação de identidade</li>
              <li>Prostituição ou tráfico humano</li>
              <li>Vírus, malware ou conteúdo prejudicial</li>
            </ul>
          </section>

          {/* 6. Planos e Pagamentos */}
          <section className="mb-10">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white mb-4">
              <CreditCard className="w-6 h-6 text-purple-600" />
              6. Planos, Pagamentos e Reembolsos
            </h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">6.1 Planos Disponíveis</h3>
            <div className="grid gap-4 mb-6">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">Plano Gratuito</h4>
                <p className="text-gray-700 dark:text-gray-300">Acesso básico com limitações</p>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900/20 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">Plano Gold (R$ 25/mês)</h4>
                <p className="text-gray-700 dark:text-gray-300">Recursos expandidos</p>
              </div>
              <div className="bg-cyan-100 dark:bg-cyan-900/20 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">Plano Diamond (R$ 45/mês)</h4>
                <p className="text-gray-700 dark:text-gray-300">Acesso completo</p>
              </div>
              <div className="bg-pink-100 dark:bg-pink-900/20 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">Plano Dupla Hot (R$ 69,90/mês)</h4>
                <p className="text-gray-700 dark:text-gray-300">Para casais</p>
              </div>
            </div>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">6.2 Política de Reembolso</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Reembolso total em até 7 dias da primeira compra</li>
              <li>Sem reembolso após 7 dias ou para renovações</li>
              <li>Créditos não utilizados não são reembolsáveis</li>
              <li>Cancelamento pode ser feito a qualquer momento</li>
            </ul>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">6.3 Monetização de Conteúdo</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Criadores de conteúdo Diamond podem monetizar, sujeito a:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Comissão de 20% (não verificados) ou 15% (verificados)</li>
              <li>Pagamentos semanais via PIX (mínimo R$ 50)</li>
              <li>Conformidade com leis fiscais brasileiras</li>
              <li>Conteúdo deve seguir nossas diretrizes</li>
            </ul>
          </section>

          {/* 7. Propriedade Intelectual */}
          <section className="mb-10">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white mb-4">
              <FileText className="w-6 h-6 text-purple-600" />
              7. Propriedade Intelectual
            </h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">7.1 Seu Conteúdo</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Você mantém todos os direitos sobre o conteúdo que compartilha, mas concede à OpenLove uma 
              licença mundial, não exclusiva, livre de royalties para:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Hospedar e exibir seu conteúdo</li>
              <li>Distribuir para outros usuários conforme suas configurações</li>
              <li>Fazer backups e cópias técnicas</li>
              <li>Promover a plataforma (com sua permissão)</li>
            </ul>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">7.2 Nossa Propriedade</h3>
            <p className="text-gray-700 dark:text-gray-300">
              A OpenLove e seus licenciadores possuem todos os direitos sobre a plataforma, incluindo 
              design, funcionalidades, código e marca.
            </p>
          </section>

          {/* 8. Privacidade e Segurança */}
          <section className="mb-10">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white mb-4">
              <Shield className="w-6 h-6 text-purple-600" />
              8. Privacidade e Segurança
            </h2>
            
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Levamos sua privacidade a sério:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Dados protegidos conforme nossa Política de Privacidade</li>
              <li>Conformidade total com a LGPD</li>
              <li>Criptografia de ponta a ponta para mensagens</li>
              <li>Verificação de identidade para maior segurança</li>
              <li>Direito de solicitar exclusão de dados</li>
            </ul>
          </section>

          {/* 9. Limitação de Responsabilidade */}
          <section className="mb-10">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white mb-4">
              <AlertTriangle className="w-6 h-6 text-purple-600" />
              9. Limitação de Responsabilidade
            </h2>
            
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4">
              <p className="text-gray-700 dark:text-gray-300 uppercase font-semibold">
                A OpenLove é fornecida "como está" e "conforme disponível".
              </p>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Não nos responsabilizamos por:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Ações de outros usuários</li>
              <li>Perda de dados ou conteúdo</li>
              <li>Interrupções do serviço</li>
              <li>Danos indiretos ou consequenciais</li>
              <li>Encontros ou relacionamentos formados através da plataforma</li>
            </ul>
          </section>

          {/* 10. Resolução de Disputas */}
          <section className="mb-10">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white mb-4">
              <Scale className="w-6 h-6 text-purple-600" />
              10. Resolução de Disputas
            </h2>
            
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Qualquer disputa será resolvida através de:
            </p>
            <ol className="list-decimal pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Negociação direta entre as partes</li>
              <li>Mediação, se a negociação falhar</li>
              <li>Arbitragem vinculante em Curitiba, PR</li>
            </ol>
            
            <p className="text-gray-700 dark:text-gray-300 mt-4">
              Estes termos são regidos pelas leis brasileiras, especificamente do Estado do Paraná.
            </p>
          </section>

          {/* 11. Modificações */}
          <section className="mb-10">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white mb-4">
              <FileText className="w-6 h-6 text-purple-600" />
              11. Modificações dos Termos
            </h2>
            
            <p className="text-gray-700 dark:text-gray-300">
              Podemos modificar estes termos a qualquer momento. Mudanças significativas serão notificadas 
              com 30 dias de antecedência. O uso continuado após as alterações constitui aceitação dos 
              novos termos.
            </p>
          </section>

          {/* 12. Disposições Gerais */}
          <section className="mb-10">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white mb-4">
              <FileText className="w-6 h-6 text-purple-600" />
              12. Disposições Gerais
            </h2>
            
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Se qualquer disposição for inválida, as demais permanecerão em vigor</li>
              <li>Nossa falha em exercer qualquer direito não constitui renúncia</li>
              <li>Estes termos constituem o acordo completo entre as partes</li>
              <li>Você não pode transferir seus direitos sem nosso consentimento</li>
            </ul>
          </section>

          {/* Contact */}
          <section className="mb-10">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white mb-4">
              <Shield className="w-6 h-6 text-purple-600" />
              13. Contato
            </h2>
            
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Para questões sobre estes Termos de Uso:
            </p>
            
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
              <p className="font-semibold text-gray-900 dark:text-white mb-2">
                OpenLove Tecnologia Ltda.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                E-mail: <a href="mailto:juridico@openlove.com.br" className="text-purple-600 hover:underline">juridico@openlove.com.br</a>
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                WhatsApp: <a href="https://wa.me/5541995034442" className="text-purple-600 hover:underline">(41) 99503-4442</a>
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Endereço: Rua XV de Novembro, 1234, Centro, Curitiba - PR, CEP 80020-310
              </p>
            </div>
          </section>
        </div>

        {/* Agreement Section */}
        <div className="mt-12 bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-lg p-6">
          <h3 className="text-lg font-bold text-purple-900 dark:text-purple-200 mb-3">
            Ao usar a OpenLove, você confirma que:
          </h3>
          <ul className="space-y-2 text-purple-800 dark:text-purple-300">
            <li className="flex items-start gap-2">
              <span className="text-purple-600">✓</span>
              Leu e compreendeu estes Termos de Uso
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600">✓</span>
              Tem pelo menos 18 anos de idade
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600">✓</span>
              Concorda em cumprir todas as regras estabelecidas
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600">✓</span>
              Entende as consequências de violações
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} OpenLove. Todos os direitos reservados.
            </p>
            <div className="flex gap-4">
              <Link href="/privacy" className="text-sm text-purple-600 hover:underline">
                Política de Privacidade
              </Link>
              <Link href="/" className="text-sm text-purple-600 hover:underline">
                Voltar ao Início
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}