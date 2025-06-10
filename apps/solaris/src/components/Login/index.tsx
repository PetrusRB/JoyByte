"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { useAuth, AuthProvider as ProviderType } from "@/contexts/auth/AuthContext";

const providers: ProviderType[] = ["google", "github", "instagram", "facebook"];

export default function EnhancedAuth() {
  const { signIn, status } = useAuth();
  const loading = status === "loading";

  const handleSignIn = (provider: ProviderType) => () => {
    signIn(provider);
  };

  const buttons = useMemo(
    () =>
      providers.map((provider) => (
        <button
          key={provider}
          onClick={handleSignIn(provider)}
          disabled={loading}
          className="w-full mb-4 inline-flex items-center justify-center py-3 px-6 border border-white rounded-2xl font-medium text-white hover:bg-white hover:text-black transition disabled:opacity-50"
        >
          Entrar com {provider.charAt(0).toUpperCase() + provider.slice(1)}
        </button>
      )),
    [loading]
  );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center bg-black text-white">
      {/* Left: login form */}
      <div className="w-full lg:w-1/2 p-6 flex flex-col items-center">
        <Image
          src="/logo.png"
          alt="Solaris Logo"
          width={100}
          height={100}
          loading="lazy"
          className="mb-6"
        />
        <h1 className="text-3xl font-bold mb-4">Solaris</h1>
        {loading ? (
          <p>Carregando...</p>
        ) : (
          <div className="w-full max-w-xs">{buttons}</div>
        )}
      </div>

      {/* Divider */}
      <div className="hidden lg:block w-px h-3/4 bg-gray-700 mx-8" />

      {/* Right: illustration */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center">
        <Image
          src="/sunflowers.webp"
          alt="Ilustração de login"
          width={500}
          height={500}
          loading="lazy"
          className="object-cover rounded-2xl"
        />
      </div>
    </div>
  );
}

/*
  Uso: coloque <EnhancedAuth /> dentro de <AuthProvider> no layout.
  Certifique-se de que o caminho de import para AuthContext está correto.
*/
