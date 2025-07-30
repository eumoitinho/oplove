'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Admin error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <h2 className="text-2xl font-semibold">Algo deu errado!</h2>
      <p className="text-gray-600 dark:text-gray-400">
        Ocorreu um erro ao carregar o painel administrativo.
      </p>
      <Button onClick={reset}>Tentar novamente</Button>
    </div>
  )
}