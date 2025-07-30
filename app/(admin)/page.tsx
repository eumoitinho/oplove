import { Suspense } from 'react'
import AdminDashboard from './AdminDashboard'
import { Loader2 } from 'lucide-react'

export default function AdminPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[600px]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    }>
      <AdminDashboard />
    </Suspense>
  )
}