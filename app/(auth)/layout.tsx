import { AuthProviderOptimized } from "@/components/auth/providers/AuthProviderOptimized"
import { PublicRoute } from "@/components/auth/guards/AuthGuard"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProviderOptimized>
      <PublicRoute>
        {children}
      </PublicRoute>
    </AuthProviderOptimized>
  )
}