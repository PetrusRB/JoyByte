import React from "react";
import { Button } from "../Button"
type Props = {
  title: string;
  desc?: string;
}
const EmptyState: React.FC<Props> = ({title, desc}) => {
  return(
    <>
      <div className="flex items-center justify-center bg-black text-white min-h-screen">
          {/* Container interno com largura máxima */}
          <div className="flex flex-col items-center w-full max-w-4xl text-center px-4 md:px-8 lg:px-12">
              {/* Conteúdo principal */}
              <main className="flex flex-col gap-6">
                  <p className="text-4xl font-extrabold">{title}</p>
                  <p className="text-lg text-gray-400">
                     {desc}
                  </p>
                  <Button
                      onClick={() => window.location.href = '/'}
                      className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-all"
                  >
                      Voltar
                  </Button>
              </main>
          </div>
      </div>
    </>
  )
}
export default EmptyState
