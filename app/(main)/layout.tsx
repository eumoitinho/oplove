import { ProtectedRoute } from "@/components/auth/guards/AuthGuard"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  )
}