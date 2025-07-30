import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

const AdminDashboard = dynamic(() => import('./AdminDashboard'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[600px]">
      <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
    </div>
  ),
})

export const metadata = {
  title: 'Admin Dashboard - OpenLove',
  description: 'Painel administrativo do OpenLove',
}

export default function AdminPage() {
  return <AdminDashboard />
}