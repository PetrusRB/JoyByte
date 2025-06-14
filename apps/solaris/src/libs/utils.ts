import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}
export function formatNumber(value: number): string {
    if (value < 1000) return value.toString();
    const units = ['', 'k', 'M', 'B', 'T', 'Q', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
    const unitIndex = Math.min(Math.floor(Math.log10(Math.abs(value)) / 3), units.length - 1);
    const scaledValue = value / Math.pow(1000, unitIndex);
    const formattedValue = scaledValue.toFixed(scaledValue >= 10 || unitIndex > 4 ? 0 : 1);
    return `${formattedValue}${units[unitIndex]}`;
}

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