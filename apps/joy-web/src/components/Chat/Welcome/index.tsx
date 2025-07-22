const WelcomeChat = () => {
  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-gradient-to-br from-orange-25 via-white to-orange-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
      <div className="text-center max-w-sm mx-auto">
        {/* Illustration Container */}
        <div className="mb-8">
          <div className="relative w-48 h-36 sm:w-64 sm:h-48 mx-auto mb-6 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-zinc-700 dark:to-zinc-600 rounded-2xl shadow-lg flex items-center justify-center overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 left-4 w-8 h-8 bg-orange-400 rounded-full"></div>
              <div className="absolute bottom-6 right-6 w-6 h-6 bg-orange-300 rounded-full"></div>
              <div className="absolute top-1/2 right-4 w-4 h-4 bg-orange-500 rounded-full"></div>
            </div>

            {/* Main Icon */}
            <div className="relative z-10 text-5xl sm:text-6xl animate-pulse">
              💬
            </div>

            {/* Floating Elements */}
            <div className="absolute top-2 right-2 text-lg animate-bounce delay-300">
              ✨
            </div>
            <div className="absolute bottom-2 left-2 text-lg animate-bounce delay-700">
              🔔
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-orange-800 dark:from-orange-400 dark:to-orange-600 bg-clip-text text-transparent">
          Chat Privado
        </h2>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 text-sm sm:text-base px-2">
          Envie e receba mensagens sem precisar manter seu celular conectado à
          internet. Use o Chat em até quatro dispositivos conectados e um
          celular ao mesmo tempo.
        </p>

        {/* Features */}
        <div className="space-y-3 mb-8">
          <div className="flex items-center justify-center gap-3 text-sm text-gray-700 dark:text-gray-300">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <span className="text-green-600 dark:text-green-400">📱</span>
            </div>
            <span>Sincronização em tempo real</span>
          </div>

          <div className="flex items-center justify-center gap-3 text-sm text-gray-700 dark:text-gray-300">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-400">☁️</span>
            </div>
            <span>Backup automático na nuvem</span>
          </div>
        </div>

        {/* Security Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-zinc-800 dark:to-zinc-700 rounded-full border border-orange-200 dark:border-zinc-600 shadow-sm">
          <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
            <span className="text-green-600 dark:text-green-400 text-sm">
              🔒
            </span>
          </div>
          <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium">
            Criptografia ponta a ponta
          </span>
        </div>

        {/* Call to Action */}
        <div className="mt-8">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Selecione uma conversa para começar
          </p>
          <div className="flex justify-center">
            <div className="w-12 h-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeChat;
