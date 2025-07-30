import { Suspense } from 'react'
import dynamic from 'next/dynamic'

const AdminLayoutClient = dynamic(() => import('./AdminLayoutClient'), {
  ssr: false,
})

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </Suspense>
  )
}