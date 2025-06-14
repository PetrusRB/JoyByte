"use client";
import { Button } from "@/components/Button";
import { ProtectedRoute, useAuth } from "@/contexts/auth/AuthContext";

const ConfigPage = () => {
    const { isAuthenticated, isLoading, signOut } = useAuth();
    const handleSignOut = async () => {
        if (isAuthenticated && !isLoading) {
            await signOut();
        }
    };
    return (
        <>
            <ProtectedRoute>
                <div className="flex items-center justify-center bg-black text-white min-h-screen">
                    {/* Container interno com largura máxima */}
                    <div className="flex flex-col items-center w-full max-w-4xl text-center px-4 md:px-8 lg:px-12">
                        {/* Conteúdo principal */}
                        <main className="flex flex-col gap-6">
                            <p className="text-4xl font-extrabold">Configurações</p>
                            <p className="text-lg text-gray-400">
                                Em breve, esta página estará disponível para você personalizar sua experiência no JoyByte.
                            </p>
                            <div className="flex flex-col items-center space-x-4">
                                <Button
                                    onClick={() => window.location.href = '/'}
                                    className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-all"
                                >
                                    Voltar para a Home
                                </Button>
                                <Button
                                    onClick={() => handleSignOut()}
                                    className="mt-6 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md transition-all"
                                >
                                    Sair
                                </Button>
                            </div>
                        </main>
                    </div>
                </div>
            </ProtectedRoute>
        </>
    )
}

export default ConfigPage;