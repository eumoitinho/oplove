import { PublicRoute } from "@/components/auth/guards/AuthGuard"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <PublicRoute>
      {children}
    </PublicRoute>
  )
}