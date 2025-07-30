import { Metadata } from 'next'
import Link from 'next/link'
import { Shield, Lock, Eye, Database, UserCheck, Mail, AlertTriangle, FileText } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Política de Privacidade - OpenLove',
  description: 'Política de Privacidade e Proteção de Dados da OpenLove - Conformidade com LGPD',
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Shield className="w-16 h-16 text-purple-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Política de Privacidade
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          {/* Introduction */}
          <section className="mb-12">
            <p className="lead text-gray-700 dark:text-gray-300">
              A OpenLove está comprometida com a proteção da privacidade e dos dados pessoais de seus usuários. 
              Esta Política de Privacidade descreve como coletamos, usamos, compartilhamos e protegemos suas 
              informações pessoais em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
            </p>
          </section>

          {/* 1. Dados Coletados */}
          <section className="mb-10">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white mb-4">
              <Database className="w-6 h-6 text-purple-600" />
              1. Dados que Coletamos
            </h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">1.1 Dados fornecidos por você:</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Informações de cadastro: nome, e-mail, data de nascimento, CPF (para verificação)</li>
              <li>Fotos e vídeos que você compartilha</li>
              <li>Mensagens e conteúdo de posts</li>
              <li>Informações de perfil e preferências</li>
              <li>Documentos para verificação de identidade (quando aplicável)</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">1.2 Dados coletados automaticamente:</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Endereço IP e informações de localização aproximada</li>
              <li>Dados de navegação e interação com a plataforma</li>
              <li>Informações do dispositivo (tipo, sistema operacional, navegador)</li>
              <li>Cookies e tecnologias similares</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">1.3 Dados sensíveis:</h3>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-gray-700 dark:text-gray-300">
                Por ser uma plataforma de relacionamento adulto, podemos processar dados considerados sensíveis, 
                como orientação sexual e preferências íntimas. Estes dados são tratados com o máximo cuidado e 
                apenas com seu consentimento explícito.
              </p>
            </div>
          </section>

          {/* 2. Como Usamos seus Dados */}
          <section className="mb-10">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white mb-4">
              <Eye className="w-6 h-6 text-purple-600" />
              2. Como Usamos seus Dados
            </h2>
            
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Fornecer e melhorar nossos serviços</li>
              <li>Verificar sua identidade e idade (18+)</li>
              <li>Personalizar sua experiência na plataforma</li>
              <li>Processar pagamentos e transações</li>
              <li>Enviar comunicações sobre a plataforma</li>
              <li>Garantir a segurança e prevenir fraudes</li>
              <li>Cumprir obrigações legais</li>
              <li>Análises e melhorias do serviço</li>
            </ul>
          </section>

          {/* 3. Compartilhamento de Dados */}
          <section className="mb-10">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white mb-4">
              <UserCheck className="w-6 h-6 text-purple-600" />
              3. Compartilhamento de Dados
            </h2>
            
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              Não vendemos seus dados pessoais. Compartilhamos informações apenas nas seguintes situações:
            </p>
            
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Com seu consentimento explícito</li>
              <li>Para processadores de pagamento (Stripe, PIX)</li>
              <li>Para prestadores de serviços essenciais (hospedagem, análise)</li>
              <li>Quando exigido por lei ou ordem judicial</li>
              <li>Para proteger direitos, propriedade ou segurança</li>
            </ul>
          </section>

          {/* 4. Seus Direitos (LGPD) */}
          <section className="mb-10">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white mb-4">
              <Lock className="w-6 h-6 text-purple-600" />
              4. Seus Direitos sob a LGPD
            </h2>
            
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              De acordo com a LGPD, você tem os seguintes direitos:
            </p>
            
            <div className="grid gap-4">
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 dark:text-purple-200 mb-2">Acesso aos dados</h4>
                <p className="text-gray-700 dark:text-gray-300">
                  Solicitar uma cópia de todos os seus dados pessoais que processamos
                </p>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 dark:text-purple-200 mb-2">Correção</h4>
                <p className="text-gray-700 dark:text-gray-300">
                  Corrigir dados incompletos, inexatos ou desatualizados
                </p>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 dark:text-purple-200 mb-2">Exclusão</h4>
                <p className="text-gray-700 dark:text-gray-300">
                  Solicitar a exclusão de seus dados pessoais (direito ao esquecimento)
                </p>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 dark:text-purple-200 mb-2">Portabilidade</h4>
                <p className="text-gray-700 dark:text-gray-300">
                  Receber seus dados em formato estruturado e interoperável
                </p>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 dark:text-purple-200 mb-2">Revogação do consentimento</h4>
                <p className="text-gray-700 dark:text-gray-300">
                  Retirar seu consentimento a qualquer momento
                </p>
              </div>
            </div>
            
            <p className="mt-4 text-gray-700 dark:text-gray-300">
              Para exercer qualquer desses direitos, entre em contato conosco através do e-mail 
              <a href="mailto:privacidade@openlove.com.br" className="text-purple-600 hover:underline ml-1">
                privacidade@openlove.com.br
              </a>
            </p>
          </section>

          {/* 5. Segurança dos Dados */}
          <section className="mb-10">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white mb-4">
              <Shield className="w-6 h-6 text-purple-600" />
              5. Segurança dos Dados
            </h2>
            
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              Implementamos medidas técnicas e organizacionais apropriadas para proteger seus dados:
            </p>
            
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Criptografia de dados em trânsito e em repouso</li>
              <li>Controles de acesso rigorosos</li>
              <li>Monitoramento contínuo de segurança</li>
              <li>Backups regulares e planos de recuperação</li>
              <li>Treinamento de equipe em proteção de dados</li>
              <li>Auditorias de segurança periódicas</li>
            </ul>
          </section>

          {/* 6. Retenção de Dados */}
          <section className="mb-10">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white mb-4">
              <Database className="w-6 h-6 text-purple-600" />
              6. Retenção de Dados
            </h2>
            
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              Mantemos seus dados pelo tempo necessário para fornecer nossos serviços ou conforme exigido por lei:
            </p>
            
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Dados de conta: mantidos enquanto a conta estiver ativa</li>
              <li>Dados de transações: 5 anos (obrigação fiscal)</li>
              <li>Logs de segurança: 6 meses</li>
              <li>Dados de verificação: 2 anos após aprovação</li>
              <li>Conteúdo excluído: removido em até 30 dias</li>
            </ul>
          </section>

          {/* 7. Cookies */}
          <section className="mb-10">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white mb-4">
              <FileText className="w-6 h-6 text-purple-600" />
              7. Cookies e Tecnologias Similares
            </h2>
            
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              Utilizamos cookies e tecnologias similares para:
            </p>
            
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Manter você conectado à plataforma</li>
              <li>Lembrar suas preferências</li>
              <li>Analisar o uso da plataforma</li>
              <li>Personalizar conteúdo e anúncios</li>
            </ul>
            
            <p className="mt-4 text-gray-700 dark:text-gray-300">
              Você pode gerenciar suas preferências de cookies nas configurações do seu navegador.
            </p>
          </section>

          {/* 8. Menores de Idade */}
          <section className="mb-10">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              8. Menores de Idade
            </h2>
            
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-gray-700 dark:text-gray-300 font-semibold">
                A OpenLove é estritamente para maiores de 18 anos. Não coletamos intencionalmente dados de 
                menores de idade. Se tomarmos conhecimento de que coletamos dados de um menor, excluiremos 
                imediatamente essas informações.
              </p>
            </div>
          </section>

          {/* 9. Alterações na Política */}
          <section className="mb-10">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white mb-4">
              <FileText className="w-6 h-6 text-purple-600" />
              9. Alterações nesta Política
            </h2>
            
            <p className="text-gray-700 dark:text-gray-300">
              Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre 
              mudanças significativas através do e-mail cadastrado ou de um aviso em nossa plataforma.
            </p>
          </section>

          {/* 10. Contato */}
          <section className="mb-10">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white mb-4">
              <Mail className="w-6 h-6 text-purple-600" />
              10. Entre em Contato
            </h2>
            
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              Se você tiver dúvidas sobre esta Política de Privacidade ou sobre como tratamos seus dados:
            </p>
            
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
              <p className="font-semibold text-gray-900 dark:text-white mb-2">
                Encarregado de Proteção de Dados (DPO)
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                E-mail: <a href="mailto:privacidade@openlove.com.br" className="text-purple-600 hover:underline">privacidade@openlove.com.br</a>
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                WhatsApp: <a href="https://wa.me/5541995034442" className="text-purple-600 hover:underline">(41) 99503-4442</a>
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Horário: Segunda a Sexta, 9h às 18h
              </p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} OpenLove. Todos os direitos reservados.
            </p>
            <div className="flex gap-4">
              <Link href="/terms" className="text-sm text-purple-600 hover:underline">
                Termos de Uso
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