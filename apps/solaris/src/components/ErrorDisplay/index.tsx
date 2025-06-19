'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle, RefreshCw, Home, ArrowLeft, Copy,
  CheckCircle, Shield, Wifi, Clock, User,
  Hash
} from 'lucide-react'
import Link from 'next/link'

interface ErrorDisplayProps {
  error: string | null
  onRetry?: () => void
}

interface ErrorDetails {
  error: string | null
  provider: string | null
  code: string | null
  details: string | null
  timestamp: string | null
  userAgent: string
  url: string
}

interface ErrorConfig {
  title: string
  message: string
  icon: React.ElementType
  color: string
  bgColor: string
  actions: Array<{
    label: string
    href?: string
    onClick?: () => void
    variant: 'primary' | 'secondary' | 'danger'
    icon?: React.ElementType
  }>
  showDetails: boolean
  canRetry: boolean
}

const errorConfigs: Record<string, ErrorConfig> = {
  invalid_provider: {
    title: 'Provedor Inválido',
    message: 'Este método de login não é suportado.',
    icon: User,
    color: 'text-zinc-800 dark:text-zinc-100',
    bgColor: 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700',
    actions: [
      { label: 'Tentar Novamente', href: '/', variant: 'primary', icon: RefreshCw },
      { label: 'Página Inicial', href: '/', variant: 'secondary', icon: Home }
    ],
    showDetails: false,
    canRetry: true
  },
  provider_disabled: {
    title: 'Serviço Indisponível',
    message: 'Este método está desabilitado temporariamente.',
    icon: Shield,
    color: 'text-zinc-800 dark:text-zinc-100',
    bgColor: 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700',
    actions: [
      { label: 'Outros Métodos', href: '/', variant: 'primary', icon: User },
      { label: 'Página Inicial', href: '/', variant: 'secondary', icon: Home }
    ],
    showDetails: false,
    canRetry: true
  },
  rate_limit: {
    title: 'Muitas Tentativas',
    message: 'Espere alguns minutos antes de tentar novamente.',
    icon: Clock,
    color: 'text-zinc-800 dark:text-zinc-100',
    bgColor: 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700',
    actions: [
      { label: 'Página Inicial', href: '/', variant: 'secondary', icon: Home }
    ],
    showDetails: false,
    canRetry: false
  },
  not_found: {
    title: 'Pagina não encontrada',
    message: 'Desculpe, mas parece que você encontrou uma página misteriosa. Talvez ela esteja em férias ou simplesmente não queria ser encontrada.',
    icon: Hash,
    color: 'text-zinc-800 dark:text-zinc-100',
    bgColor: 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700',
    actions: [
      { label: 'Tentar Novamente', href: '/', variant: 'primary', icon: RefreshCw },
      { label: 'Página Inicial', href: '/', variant: 'secondary', icon: Home }
    ],
    showDetails: false,
    canRetry: true
  },
  network: {
    title: 'Problema de Conexão',
    message: 'Verifique sua conexão com a internet.',
    icon: Wifi,
    color: 'text-zinc-800 dark:text-zinc-100',
    bgColor: 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700',
    actions: [
      { label: 'Tentar Novamente', href: '/', variant: 'primary', icon: RefreshCw },
      { label: 'Página Inicial', href: '/', variant: 'secondary', icon: Home }
    ],
    showDetails: false,
    canRetry: true
  },
  server_error: {
    title: 'Erro Interno',
    message: 'Estamos trabalhando para corrigir o problema.',
    icon: AlertTriangle,
    color: 'text-zinc-800 dark:text-zinc-100',
    bgColor: 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700',
    actions: [
      { label: 'Tentar Novamente', href: '/', variant: 'primary', icon: RefreshCw },
      { label: 'Página Inicial', href: '/', variant: 'secondary', icon: Home }
    ],
    showDetails: true,
    canRetry: true
  }
}

const defaultErrorConfig: ErrorConfig = {
  title: 'Erro desconhecido',
  message: 'Ocorreu um erro inesperado.',
  icon: AlertTriangle,
  color: 'text-zinc-800 dark:text-zinc-100',
  bgColor: 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700',
  actions: [
    { label: 'Tentar Novamente', href: '/', variant: 'primary', icon: RefreshCw },
    { label: 'Página Inicial', href: '/', variant: 'secondary', icon: Home }
  ],
  showDetails: true,
  canRetry: true
}

export default function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)

  const message = searchParams.get('message')

  const config = useMemo<ErrorConfig>(() => {
    if (error && errorConfigs[error]) return errorConfigs[error]
    if (message) return { ...defaultErrorConfig, message: decodeURIComponent(message) }
    return defaultErrorConfig
  }, [error, message])

  const details: ErrorDetails = useMemo(() => ({
    error,
    provider: searchParams.get('provider'),
    code: searchParams.get('code'),
    details: searchParams.get('details'),
    timestamp: searchParams.get('timestamp'),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
    url: typeof window !== 'undefined' ? window.location.href : 'N/A'
  }), [searchParams, error])

  useEffect(() => {
    if (config.canRetry && error === 'network') {
      setCountdown(10)
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (!prev || prev <= 1) {
            clearInterval(interval)
            router.push('/')
            return null
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(interval)
    }
    return () => {}
  }, [config, error, router])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(details, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      console.error("Erro ao copiar:", e)
    }
  }

  const Icon = config.icon

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-orange-50 dark:bg-black text-orange-700 dark:text-zinc-100 transition-colors">
      <div className="w-full max-w-lg space-y-6">
        <div className={`rounded-2xl p-6 shadow-xl ${config.bgColor}`}>
          <div className={`flex justify-center mb-4 ${config.color}`}>
            <Icon size={48} />
          </div>
          <h1 className="text-2xl font-semibold text-center">{config.title}</h1>
          <p className="text-center text-sm text-zinc-600 dark:text-zinc-400 mt-2">
            {config.message}
          </p>
          {countdown !== null && (
            <p className="text-center text-sm mt-2 text-blue-600 dark:text-blue-400">
              Redirecionando em {countdown}s
            </p>
          )}
          <div className="mt-6 space-y-2">
            {config.actions.map((a, i) => {
              const AIcon = a.icon
              const base = `w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition`
              const variant =
                a.variant === 'primary' ? 'bg-black text-white hover:bg-zinc-800' :
                a.variant === 'secondary' ? 'border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800' :
                'bg-red-600 text-white hover:bg-red-700'

              const className = `${base} ${variant}`

              return a.href ? (
                <Link key={i} href={a.href} className={className}>
                  {AIcon && <AIcon size={18} />}
                  {a.label}
                </Link>
              ) : (
                <button key={i} onClick={a.onClick ?? onRetry} className={className}>
                  {AIcon && <AIcon size={18} />}
                  {a.label}
                </button>
              )
            })}
            <button onClick={() => router.back()} className="w-full text-center text-sm text-zinc-500 hover:underline mt-2">
              <ArrowLeft size={14} className="inline-block mr-1" /> Voltar
            </button>
          </div>
        </div>

        {config.showDetails && (
          <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-4 text-sm shadow">
            <div className="flex justify-between mb-3">
              <strong className="text-zinc-700 dark:text-zinc-200">Detalhes Técnicos</strong>
              <button onClick={handleCopy} className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 text-xs">
                {copied ? <CheckCircle size={14} /> : <Copy size={14} />} {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
            {Object.entries(details).map(([k, v]) => v && (
              <div key={k} className="flex text-zinc-700 dark:text-zinc-300">
                <span className="w-24 font-medium">{k}:</span>
                <span className="break-all">{v}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
