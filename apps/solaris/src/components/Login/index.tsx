"use client";

import React, { JSX, useMemo } from "react";
import Image from "next/image";
import { useAuth } from "@/contexts/auth/AuthContext";
import { Provider } from "@/types";

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
        <button
          key={provider}
          onClick={handleSignIn(provider)}
          disabled={isLoading}
          className="w-full mb-4 inline-flex items-center justify-center space-x-2 py-3 px-6 rounded-2xl bg-orange-600 hover:bg-orange-700 transition disabled:opacity-50"
        >
          {providerIcons[provider]}
          <span className="text-white font-medium">
            Entrar com {provider.charAt(0).toUpperCase() + provider.slice(1)}
          </span>
        </button>
      )),
    [isLoading]
  );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center bg-black text-white">
      {/* Left: login form */}
      <div className="w-full lg:w-1/2 p-6 flex flex-col items-center">
        <Image
          src="/favicon.ico"
          alt="Logo"
          width={100}
          height={100}
          className="mb-6"
          priority
        />
        <h1 className="text-3xl font-bold mb-4">JoyByte</h1>
        {isLoading ? (
          <p className="animate-pulse">Carregando...</p>
        ) : (
          <>
            <div className="w-full max-w-xs">{buttons}</div>
          </>
        )}
      </div>

      {/* Divider */}
      <div className="hidden lg:block w-px h-3/4 bg-gray-700 mx-8" />

      {/* Right: illustration */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-6">
        <div className="relative w-full max-w-md">
          <img
            src="https://ik.imagekit.io/9k3mcoolader/ilustration-min.png?updatedAt=1749844267853"
            alt="Ilustração"
            className="object-cover w-full h-auto rounded-lg shadow-lg"
          />
        </div>
      </div>
    </div>
  );
}