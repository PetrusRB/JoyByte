import { AppError } from "@/libs/errors";
import { Button } from "../Button";

interface ErrorDisplayProps {
  error: AppError;
  onRetry?: () => void;
}

export default function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
  return (
    <div className="min-h-screen flex flex-col dark:text-white text-orange-700 items-center justify-center text-center p-8">
      <h1 className="text-4xl font-bold mb-2">{error.title}</h1>
      <p className="text-gray-600 text-lg mb-6">{error.message}</p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Tentar novamente
        </button>
      )}

      <Button
          onClick={() => window.location.href = '/'}
          className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-all"
      >
          Voltar
      </Button>
    </div>
  );
}
