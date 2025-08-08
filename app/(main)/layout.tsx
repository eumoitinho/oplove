import { ProtectedRoute } from "@/components/auth/guards/AuthGuard"
// import { IncomingCallModal } from "@/components/calls/IncomingCallModal"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      {/* <IncomingCallModal /> */}
      {children}
    </ProtectedRoute>
  )
}