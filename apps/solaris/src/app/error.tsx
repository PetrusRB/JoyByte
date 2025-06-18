'use client'

import ErrorDisplay from '@/components/ErrorDisplay'
import { useEffect } from 'react'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('Erro capturado pelo boundary:', error)
  }, [error])

  // Mapeia o erro genérico para uma chave conhecida (se quiser mais detalhado, crie uma função de mapeamento)
  const errorKey = (() => {
    if (error.message.includes('invalid_provider')) return 'invalid_provider'
    if (error.message.includes('provider_disabled')) return 'provider_disabled'
    if (error.message.includes('rate_limit')) return 'rate_limit'
    if (error.message.includes('network')) return 'network'
    if (error.message.includes('server')) return 'server_error'
    return null
  })()

  return <ErrorDisplay error={errorKey} onRetry={reset} />
}
