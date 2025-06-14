"use client";

import React, { JSX, useMemo } from "react";
import { useAuth } from "@/contexts/auth/AuthContext";
import { Provider } from "@/types";
import { Button } from "../Button";

const providers: Provider[] = ["google", "github", "facebook"];
// Mapeia provider para SVG inline
const providerIcons: Record<Provider, JSX.Element> = {
  google: (
    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" className="w-8 h-8" viewBox="0 0 120 120">
      <path d="M107.145,55H100H87.569H60v18h27.569c-1.852,5.677-5.408,10.585-10.063,14.118 C72.642,90.809,66.578,93,60,93c-12.574,0-23.278-8.002-27.299-19.191C31.6,70.745,31,67.443,31,64 c0-3.839,0.746-7.505,2.101-10.858C37.399,42.505,47.823,35,60,35c7.365,0,14.083,2.75,19.198,7.273l13.699-13.21 C84.305,20.969,72.736,16,60,16c-18.422,0-34.419,10.377-42.466,25.605C14,48.291,12,55.912,12,64c0,7.882,1.9,15.32,5.267,21.882 C25.223,101.389,41.372,112,60,112c12.382,0,23.668-4.688,32.182-12.386C101.896,90.831,108,78.128,108,64 C108,60.922,107.699,57.917,107.145,55z" opacity=".35"></path><path fill="#44bf00" d="M17.267,81.882C25.223,97.389,41.372,108,60,108c12.382,0,23.668-4.688,32.182-12.386L77.506,83.118 C72.642,86.809,66.577,89,60,89c-12.574,0-23.278-8.002-27.299-19.191L17.267,81.882z"></path><path d="M77.506,83.118c-0.684,0.553-1.685,1.158-2.398,1.638l14.711,12.846 c0.807-0.641,1.6-1.298,2.363-1.988L77.506,83.118z" opacity=".35"></path><path fill="#0075ff" d="M92.182,95.614C101.896,86.83,108,74.128,108,60c0-3.078-0.301-6.083-0.855-9H100H87.569H60v18 h27.569c-1.852,5.677-5.408,10.585-10.063,14.118L92.182,95.614z"></path><path d="M32.701,69.809L17.267,81.882c0.486,0.948,1.004,1.877,1.551,2.787l15.3-11.576 C33.63,72.181,33.05,70.804,32.701,69.809z" opacity=".35"></path><path fill="#ffc400" d="M17.267,81.882C13.9,75.32,12,67.882,12,60c0-8.088,2-15.709,5.534-22.395l15.568,11.537 C31.746,52.496,31,56.161,31,60c0,3.443,0.6,6.745,1.701,9.809L17.267,81.882z"></path><path d="M17.534,37.605c-0.482,0.844-1.169,2.36-1.564,3.251l16.059,11.491 c0.299-1.095,0.653-2.167,1.072-3.205L17.534,37.605z" opacity=".35"></path><path fill="#ff1200" d="M33.101,49.142C37.399,38.505,47.823,31,60,31c7.365,0,14.083,2.75,19.198,7.273l13.699-13.21 C84.305,16.969,72.736,12,60,12c-18.422,0-34.419,10.377-42.466,25.605L33.101,49.142z"></path>
    </svg>
  ),
  github: (
    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" className="w-8 h-8" viewBox="0 0 72 72">
      <path d="M36,12c13.255,0,24,10.745,24,24c0,10.656-6.948,19.685-16.559,22.818c0.003-0.009,0.007-0.022,0.007-0.022	s-1.62-0.759-1.586-2.114c0.038-1.491,0-4.971,0-6.248c0-2.193-1.388-3.747-1.388-3.747s10.884,0.122,10.884-11.491	c0-4.481-2.342-6.812-2.342-6.812s1.23-4.784-0.426-6.812c-1.856-0.2-5.18,1.774-6.6,2.697c0,0-2.25-0.922-5.991-0.922	c-3.742,0-5.991,0.922-5.991,0.922c-1.419-0.922-4.744-2.897-6.6-2.697c-1.656,2.029-0.426,6.812-0.426,6.812	s-2.342,2.332-2.342,6.812c0,11.613,10.884,11.491,10.884,11.491s-1.097,1.239-1.336,3.061c-0.76,0.258-1.877,0.576-2.78,0.576	c-2.362,0-4.159-2.296-4.817-3.358c-0.649-1.048-1.98-1.927-3.221-1.927c-0.817,0-1.216,0.409-1.216,0.876s1.146,0.793,1.902,1.659	c1.594,1.826,1.565,5.933,7.245,5.933c0.617,0,1.876-0.152,2.823-0.279c-0.006,1.293-0.007,2.657,0.013,3.454	c0.034,1.355-1.586,2.114-1.586,2.114s0.004,0.013,0.007,0.022C18.948,55.685,12,46.656,12,36C12,22.745,22.745,12,36,12z"></path>
    </svg>
  ),
  facebook: (
    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" className="w-8 h-8" viewBox="0 0 48 48">
      <path fill="#039be5" d="M24 5A19 19 0 1 0 24 43A19 19 0 1 0 24 5Z"></path><path fill="#fff" d="M26.572,29.036h4.917l0.772-4.995h-5.69v-2.73c0-2.075,0.678-3.915,2.619-3.915h3.119v-4.359c-0.548-0.074-1.707-0.236-3.897-0.236c-4.573,0-7.254,2.415-7.254,7.917v3.323h-4.701v4.995h4.701v13.729C22.089,42.905,23.032,43,24,43c0.875,0,1.729-0.08,2.572-0.194V29.036z"></path>
    </svg>
  ),
};
export default function EnhancedAuth() {
  const { signIn, isLoading } = useAuth();
  const handleSignIn = (provider: Provider) => () => {
    signIn(provider);
  };

  const buttons = useMemo(
    () =>
      providers.map((provider) => (
        <Button
          key={provider}
          onClick={handleSignIn(provider)}
          disabled={isLoading}
          className="w-full bg-white hover:bg-gray-50 text-gray-800 border-0 h-12 rounded-xl font-medium transition-all duration-200 hover:scale-105 shadow-lg"
        >
          {providerIcons[provider]}
          Entrar com {provider.charAt(0).toUpperCase() + provider.slice(1)}
        </Button>
      )),
    [isLoading]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-600 via-amber-600 to-orange-700 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-0 bg-white rounded-3xl overflow-hidden min-h-[600px]">

          {/* Left Side - Login Form */}
          <div className="flex flex-col justify-center p-8 lg:p-12 bg-gradient-to-br from-orange-600 via-amber-600 to-orange-700">
            <div className="max-w-md mx-auto w-full">
              {/* Logo/Title */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <div className="w-8 h-8 bg-white rounded-full"></div>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Bem-vindo!</h1>
                <p className="text-orange-100">Entre na sua conta para continuar</p>
              </div>

              {/* Social Login Buttons */}
              <div className="space-y-4">
                {buttons}
              </div>

              {/* Terms */}
              <p className="text-center text-orange-100 text-sm mt-6">
                Ao continuar, você concorda com nossos{" "}
                <span className="underline cursor-pointer hover:text-white">Termos de Uso</span>
                {" "}e{" "}
                <span className="underline cursor-pointer hover:text-white">Política de Privacidade</span>
              </p>
            </div>
          </div>

          {/* Right Side - Creative Banner */}
          <div className="relative bg-gradient-to-br from-amber-400 via-orange-400 to-red-400 p-8 lg:p-12 flex items-center justify-center">
            {/* Background Decorations */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
              <div className="absolute top-32 right-20 w-12 h-12 bg-white/20 rounded-full animate-bounce"></div>
              <div className="absolute bottom-20 left-20 w-16 h-16 bg-white/15 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              <div className="absolute bottom-32 right-12 w-8 h-8 bg-white/25 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>

              {/* Geometric shapes */}
              <div className="absolute top-20 right-10 w-24 h-24 border-2 border-white/20 rotate-45 rounded-lg"></div>
              <div className="absolute bottom-40 left-8 w-16 h-16 border-2 border-white/30 rotate-12 rounded-lg"></div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 text-center text-white">
              <div className="mb-8">
                <div className="w-32 h-32 bg-white/20 rounded-full mx-auto mb-6 flex items-center justify-center backdrop-blur-sm">
                  <div className="w-20 h-20 bg-gradient-to-br from-white/40 to-white/60 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                  Conecte-se
                  <br />
                  <span className="text-white/90">com o Futuro</span>
                </h2>
                <p className="text-xl text-white/80 leading-relaxed max-w-md mx-auto">
                  Junte-se a milhares de usuários que já descobriram uma nova forma de se conectar
                </p>
              </div>

              {/* Feature highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="w-8 h-8 bg-white/20 rounded-lg mx-auto mb-2 flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                  <p className="text-sm font-medium">Seguro</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="w-8 h-8 bg-white/20 rounded-lg mx-auto mb-2 flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                  <p className="text-sm font-medium">Rápido</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="w-8 h-8 bg-white/20 rounded-lg mx-auto mb-2 flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                  <p className="text-sm font-medium">Fácil</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}