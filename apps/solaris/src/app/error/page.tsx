'use client'

import { Suspense, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import ErrorDisplay from '@/components/ErrorDisplay'

function ErrorWrapper() {
  const searchParams = useSearchParams()

  const error = useMemo(() => {
    const raw = searchParams.get('error')
    const message = searchParams.get('message')

    // Se `error` for uma string conhecida (mapped), usa ela.
    // Se tiver apenas `message`, trata como erro desconhecido e deixa o `ErrorDisplay` cuidar.
    if (raw) return raw
    if (message) return 'unknown'
    return null
  }, [searchParams])

  if (!error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center text-gray-600 p-4">
        Nenhum erro especificado na URL.
      </div>
    )
  }

  return <ErrorDisplay error={error} />
}

export default function ErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      }
    >
      <ErrorWrapper />
    </Suspense>
  )
}
