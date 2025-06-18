'use client';
import { ComponentType, useEffect, JSX } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Loading } from '@/components/Loading';

export function withPrivate<T>(Component: ComponentType<T>) {
  return (props: T) => {
    const { isAuthenticated, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.replace("/") // ou rota pública
      }
    }, [isAuthenticated, isLoading, router])

    if (isLoading || !isAuthenticated) return <Loading />

    return <Component {...props as unknown as T & JSX.IntrinsicAttributes} />;
  };
}
