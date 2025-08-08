export const metadata = {
  title: 'Admin - OpenLove',
  description: 'Painel administrativo do OpenLove',
}

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-slate-950 dark:via-gray-900 dark:to-slate-950">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Painel Administrativo</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-semibold mb-2">Usuários</h2>
            <p className="text-gray-600 dark:text-gray-400">Gerenciar usuários</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-semibold mb-2">Financeiro</h2>
            <p className="text-gray-600 dark:text-gray-400">Dashboard financeiro</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-semibold mb-2">Moderação</h2>
            <p className="text-gray-600 dark:text-gray-400">Moderar conteúdo</p>
          </div>
        </div>
      </div>
    </div>
  )
}