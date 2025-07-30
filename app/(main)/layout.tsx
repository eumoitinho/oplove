import { AuthProviderOptimized } from "@/components/auth/providers/AuthProviderOptimized"
import { ProtectedRoute } from "@/components/auth/guards/AuthGuard"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProviderOptimized>
      <ProtectedRoute>
        {children}
      </ProtectedRoute>
    </AuthProviderOptimized>
  )
}