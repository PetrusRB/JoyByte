import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Transforma um slug ou nome de usuário em uma string de busca normalizada.
 * Garante que qualquer combinação de maiúsculas/minúsculas ou separadores funcione.
 *
 * Ex: "PeDrO--_ " => "pedro"
 *
 * @param username - Nome de usuário bruto
 * @returns String pronta para busca no banco (compatível com normalized_name)
 */
 export const slugToSearchQuery = (username: string): string => {
   return username
     .normalize("NFKC")                      // Normaliza Unicode (acentos, espaços invisíveis)
     .replace(/[\.\_\-\s]+/g, " ")           // Substitui pontuação e separadores por espaço
     .trim()
     .toLowerCase();                         // Insensível a maiúsculas/minúsculas
 };
/**
 * Formata o slug para um nome de exibição amigável (capitalizado).
 * Ex: "john_doe" => "John Doe"
 *
 * @param username - Nome de usuário bruto
 * @returns Nome de exibição bonitinho
 */
export const slugToDisplayName = (username: string): string => {
  return username
    .normalize("NFKC")
    .replace(/[\.\_\-\s]+/g, " ")
    .trim()
    .split(/\s+/)
    .map(part =>
      part.charAt(0).toLocaleUpperCase() + part.slice(1).toLocaleLowerCase()
    )
    .join(" ");
};


// Format Numbers, Dates and Relative Times.
export function formatNumber(value: number): string {
    if (value < 1000) return value.toString();
    const units = ['', 'k', 'M', 'B', 'T', 'Q', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
    const unitIndex = Math.min(Math.floor(Math.log10(Math.abs(value)) / 3), units.length - 1);
    const scaledValue = value / Math.pow(1000, unitIndex);
    const formattedValue = scaledValue.toFixed(scaledValue >= 10 || unitIndex > 4 ? 0 : 1);
    return `${formattedValue}${units[unitIndex]}`;
}
// Format date to Brazilian Portuguese locale
export function formatRelativeTime(date: Date | null): string {
    if (!date || !(date instanceof Date)) return "";
    const now = Date.now();
    const diffInSeconds = Math.floor((now - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'agora mesmo';

    const timeUnits = [
        { limit: 3600, unit: 'minuto', divisor: 60 },
        { limit: 86400, unit: 'hora', divisor: 3600 },
        { limit: 2592000, unit: 'dia', divisor: 86400 }
    ];

    for (const { limit, unit, divisor } of timeUnits) {
        if (diffInSeconds < limit) {
            const value = Math.floor(diffInSeconds / divisor);
            return `${value} ${value === 1 ? unit : unit + 's'} atrás`;
        }
    }

    return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Get file type from URL based on extension
export function getFileTypeFromUrl(url: string): 'image' | 'video' | 'unknown' {
    const extension = url.split('.').pop()?.toLowerCase();

    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const videoExts = ['mp4', 'webm', 'ogg', 'mov'];

    if (extension && imageExts.includes(extension)) return 'image';
    if (extension && videoExts.includes(extension)) return 'video';
    return 'unknown';
}

// Fetch content type from URL using HEAD request
export async function fetchContentType(url: string): Promise<'image' | 'video' | 'unknown'> {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        const contentType = response.headers.get('Content-Type');

        if (contentType?.startsWith('image/')) return 'image';
        if (contentType?.startsWith('video/')) return 'video';
    } catch (err) {
        console.warn("Erro ao detectar tipo de conteúdo", err);
    }

    return 'unknown';
}
