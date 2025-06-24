import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const DEFAULT_AVATAR = "/user.png";
export const DEFAULT_BANNER = "/placeholder.png";
export const DEFAULT_BIO = "🎮️♥️";
const ENV_PREFIX = process.env.NODE_ENV === "production" ? "prod" : "dev";

export function getCacheKey(base: string): string {
  return `${ENV_PREFIX}:${base}`;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getUserSlug(name: string) {
  const slugProfile = slugToSearchQuery(name ?? "");
  return "/user/:user".replace(":user", slugProfile.replace(" ", "."));
}

export function getInitials(name: string) {
  if (!name) return "";
  const initials = name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return initials;
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
    .normalize("NFKC") // Normaliza Unicode (acentos, espaços invisíveis)
    .replace(/[\.\_\-\s]+/g, " ") // Substitui pontuação e separadores por espaço
    .trim()
    .toLowerCase(); // Insensível a maiúsculas/minúsculas
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
    .map(
      (part) =>
        part.charAt(0).toLocaleUpperCase() + part.slice(1).toLocaleLowerCase(),
    )
    .join(" ");
};

// Format Numbers, Dates and Relative Times.
export function formatNumber(value: number): string {
  if (value < 1000) return value.toString();
  const units = [
    "",
    "k",
    "M",
    "B",
    "T",
    "Q",
    "Qi",
    "Sx",
    "Sp",
    "Oc",
    "No",
    "Dc",
  ];
  const unitIndex = Math.min(
    Math.floor(Math.log10(Math.abs(value)) / 3),
    units.length - 1,
  );
  const scaledValue = value / Math.pow(1000, unitIndex);
  const formattedValue = scaledValue.toFixed(
    scaledValue >= 10 || unitIndex > 4 ? 0 : 1,
  );
  return `${formattedValue}${units[unitIndex]}`;
}
// Format date to Brazilian Portuguese locale
export function formatRelativeTime(rawDate: string | Date | null): string {
  if (!rawDate) return "";

  const date = rawDate instanceof Date ? rawDate : new Date(rawDate);
  if (isNaN(date.getTime())) return "";

  const now = Date.now();
  const diffInSeconds = Math.floor((now - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "agora mesmo";

  const units = [
    { limit: 3600, singular: "minuto", plural: "minutos", divisor: 60 },
    { limit: 86400, singular: "hora", plural: "horas", divisor: 3600 },
    { limit: 2592000, singular: "dia", plural: "dias", divisor: 86400 },
    { limit: 31536000, singular: "mês", plural: "meses", divisor: 2592000 },
  ];

  for (const { limit, singular, plural, divisor } of units) {
    if (diffInSeconds < limit) {
      const value = Math.floor(diffInSeconds / divisor);
      const unit = value === 1 ? singular : plural;
      return `há ${value} ${unit}`;
    }
  }

  // Fallback para datas com mais de 1 ano
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

// Get file type from URL based on extension
export function getFileTypeFromUrl(url: string): "image" | "video" | "unknown" {
  const extension = url.split(".").pop()?.toLowerCase();

  const imageExts = ["jpg", "jpeg", "png", "gif", "webp"];
  const videoExts = ["mp4", "webm", "ogg", "mov"];

  if (extension && imageExts.includes(extension)) return "image";
  if (extension && videoExts.includes(extension)) return "video";
  return "unknown";
}

// Fetch content type from URL using HEAD request
export async function fetchContentType(
  url: string,
): Promise<"image" | "video" | "unknown"> {
  try {
    const response = await fetch(url, { method: "HEAD" });
    const contentType = response.headers.get("Content-Type");

    if (contentType?.startsWith("image/")) return "image";
    if (contentType?.startsWith("video/")) return "video";
  } catch (err) {
    console.warn("Erro ao detectar tipo de conteúdo", err);
  }

  return "unknown";
}
