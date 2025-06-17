import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import {z} from 'zod'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}
// Define allowed domains for return URLs
const ALLOWED_DOMAINS = process.env.NEXT_PUBLIC_ALLOWED_RETURN_DOMAINS?.split(',').map(d => d.trim()) ?? ['localhost', 'example.com']

// URL validation schema
const UrlSchema = z.string().url().refine(
  (url) => {
    try {
      const parsedUrl = new URL(url)
      return (
        // Allow relative URLs starting with /
        url.startsWith('/') ||
        // Allow URLs from allowed domains
        ALLOWED_DOMAINS.some(domain => parsedUrl.hostname === domain || parsedUrl.hostname.endsWith(`.${domain}`)) ||
        // Allow localhost for development
        parsedUrl.hostname === 'localhost' ||
        parsedUrl.hostname === '127.0.0.1'
      )
    } catch {
      return false
    }
  },
  { message: 'Invalid or unauthorized return URL' }
)
/**
 * Sanitizes and validates a return URL
 * @param returnTo - The URL to validate
 * @param fallback - Optional fallback URL if validation fails
 * @returns Safe, validated URL
 */
export function getSafeReturnUrl(returnTo?: string, fallback: string = DEFAULT_RETURN_URL): string {
  try {
    // Handle undefined or empty input
    if (!returnTo || returnTo.trim() === '') {
      return fallback
    }

    // Handle relative URLs
    if (returnTo.startsWith('/')) {
      // Ensure no dangerous characters
      const sanitizedPath = returnTo.replace(/[<>"'`;]/g, '')
      return sanitizedPath || fallback
    }

    // Validate absolute URL
    const validatedUrl = UrlSchema.safeParse(returnTo)
    if (!validatedUrl.success) {
      console.warn('Invalid return URL', { error: validatedUrl.error.message, returnTo })
      return fallback
    }

    const parsedUrl = new URL(validatedUrl.data)

    // Additional security checks
    if (parsedUrl.protocol !== 'https:' && parsedUrl.hostname !== 'localhost' && parsedUrl.hostname !== '127.0.0.1') {
      console.warn('Non-HTTPS URL detected', { returnTo })
      return fallback
    }

    // Remove any potentially dangerous query parameters
    const safeUrl = new URL(parsedUrl.origin + parsedUrl.pathname)
    return safeUrl.toString()

  } catch (error) {
    console.error('Error processing return URL', {
      error: error instanceof Error ? error.message : 'Unknown error',
      returnTo,
    })
    return fallback
  }
}
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
