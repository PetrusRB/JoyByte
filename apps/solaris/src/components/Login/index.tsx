import Image from 'next/image';
import React, { useState, useCallback, FormEvent } from 'react';
import { Eye, EyeClosed } from "lucide-react";
import { useTranslation } from 'react-i18next';
type LoginType = 'login' | 'signup';

export default function EnhancedAuth() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [authType, setAuthType] = useState<LoginType>('signup');
  const { t, i18n } = useTranslation('common')

  const isValidEmail = useCallback((email: string) => {
    // Simple RFC 5322 email validation
    return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
  }, []);

  const onLogin = useCallback(
    async (email: string, password: string) => {
      console.log('Logging in with:', { email, password });
    }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!isValidEmail(email)) {
        setError('Insira um email válido.');
        return;
      }
      if (password.length < 6) {
        setError('Senha deve ter ao menos 6 caracteres.');
        return;
      }
      setError(null);
      setLoading(true);
      try {
        await onLogin(email, password);
      } catch (err) {
        console.error(err);
        setError('Falha ao autenticar. Tente novamente.');
      } finally {
        setLoading(false);
      }
    },
    [email, password, onLogin, isValidEmail]
  );

  return (
    // Container responsivo: mobile com fundo, desktop split
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center lg:bg-none"
    // style={{ backgroundImage: "url('" + "/sunflowers.webp" + "')" }}
    >
      <div className="flex flex-col lg:flex-row w-full max-w-6xl bg-transparent">
        {/* Form no left ou centro */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md bg-white rounded-2xl p-8 space-y-6 min-h-[450px]"
            noValidate
          >
            <Image
              src={"/logo.png"}
              alt="Solaris Logo"
              width={96}
              height={96}
              className="mx-auto mb-6"
              loading='lazy'
            />
            <h3 className='text-center text-2xl text-zinc-700 transition-colors hover:text-yellow-300 font-bold'>Solaris</h3>
            {error && (
              <div className="text-red-600 text-sm text-center" role="alert">
                {error}
              </div>
            )}
            <div className="space-y-4">
              {authType === 'signup' && (
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    {t('Username')}
                  </label>
                  <input
                    id="username"
                    type="text"
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              )}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  {t('Email')}
                </label>
                <input
                  id="email"
                  type="email"
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="relative">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  {t('Password')}
                </label>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg pr-10 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center text-gray-500"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? (
                    <EyeClosed size={20} aria-hidden="true" />
                  ) : (
                    <Eye size={20} aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-2xl shadow-sm text-white font-medium bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
            >
              {loading ? 'Carregando...' : (
                authType === 'login' ? t("Login") : t("Register")
              )}
            </button>
            <p className="text-center text-sm text-gray-600">
              {authType === "login" ? "Não tem uma conta?" : "Já tem uma conta? "}{' '}
              <a onClick={() => setAuthType(authType === "signup" ? "login" : "signup")} className="font-medium text-yellow-500 hover:underline">
                {authType === "signup" ? t("Login") : t("Register")}
              </a>
            </p>
          </form>
        </div>
        {/* Divider e imagem apenas em desktop */}
        <div className="hidden lg:flex items-center">
          <div className="w-px h-3/4 bg-gray-300 mx-4" />
        </div>
        <div className="hidden lg:block lg:w-1/2">
          <img
            src={"/sunflowers.webp"}
            alt="Ilustração de login"
            className="object-cover w-full h-full rounded-r-2xl"
          />
        </div>
      </div>
    </div>
  );
};