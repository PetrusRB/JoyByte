export type AppErrorType =
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "INTERNAL"
  | "VALIDATION"
  | "FETCH"
  | "UNKNOWN";

export interface AppError {
  type: AppErrorType;
  title: string;
  message: string;
  statusCode?: number;
}

export const errorMap: Record<AppErrorType, AppError> = {
  NOT_FOUND: {
    type: "NOT_FOUND",
    title: "Página não encontrada",
    message: "A página que você procura não existe.",
    statusCode: 404,
  },
  UNAUTHORIZED: {
    type: "UNAUTHORIZED",
    title: "Acesso negado",
    message: "Você precisa estar logado para acessar essa página.",
    statusCode: 401,
  },
  INTERNAL: {
    type: "INTERNAL",
    title: "Erro interno",
    message: "Algo deu errado no servidor.",
    statusCode: 500,
  },
  VALIDATION: {
    type: "VALIDATION",
    title: "Dados inválidos",
    message: "Algum campo foi preenchido incorretamente.",
    statusCode: 400,
  },
  FETCH: {
    type: "FETCH",
    title: "Erro ao buscar dados",
    message: "Não foi possível carregar as informações.",
    statusCode: 502,
  },
  UNKNOWN: {
    type: "UNKNOWN",
    title: "Erro desconhecido",
    message: "Um erro inesperado aconteceu.",
    statusCode: 520,
  },
};

export const getErrorDetails = (type: AppErrorType): AppError =>
  errorMap[type] ?? errorMap.UNKNOWN;
