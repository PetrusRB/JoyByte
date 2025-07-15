import { usePathname } from "next/navigation";

/**
 * Retorna `true` se a rota atual **não** deve renderizar algo baseado nos caminhos fornecidos.
 * Útil para condicional de visibilidade em componentes.
 */
export function useShouldHideOnPath(pathsToExclude: string[]): boolean {
  const pathname = usePathname();
  return pathsToExclude.some((path) => pathname.includes(path));
}
