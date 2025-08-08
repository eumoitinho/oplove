import dynamic from 'next/dynamic'

const AdminDashboard = dynamic(() => import('./dashboard').then(mod => mod.AdminDashboard), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen">Carregando...</div>
})

export const metadata = {
  title: 'Admin Dashboard - OpenLove',
  description: 'Painel administrativo do OpenLove',
}

export default function AdminPage() {
  return <AdminDashboard />
}