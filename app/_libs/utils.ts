import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// Teach tailwind-merge the design-system names added in globals.css, so e.g.
// `text-md` is treated as a font size (not a colour) and `shadow-sh` replaces
// `shadow-sh-lg` instead of both being kept.
const twMerge = extendTailwindMerge({
    extend: {
        theme: {
            text: ['2xs', 'md'],
            shadow: ['sh', 'sh-lg', 'modal', 'hairline', 'hairline-strong', 'focus', 'error'],
            // Design-system colours (globals.css @theme), so `bg-d100` overrides `bg-background`
            // and `bg-avatar-3` overrides `bg-avatar-1` instead of both classes being kept.
            color: [
                'background',
                'foreground',
                'card',
                'card-foreground',
                'popover',
                'popover-foreground',
                'primary',
                'primary-foreground',
                'primary-hover',
                'secondary',
                'secondary-foreground',
                'muted',
                'muted-foreground',
                'accent',
                'accent-foreground',
                'destructive',
                'destructive-foreground',
                'border',
                'input',
                'ring',
                'chart-1',
                'chart-2',
                'chart-3',
                'chart-4',
                'chart-5',
                'sidebar',
                'sidebar-foreground',
                'sidebar-primary',
                'sidebar-primary-foreground',
                'sidebar-accent',
                'sidebar-accent-foreground',
                'sidebar-border',
                'sidebar-ring',
                'side',
                'canvas',
                'glass',
                'overlay',
                'spot',
                'd100',
                'd200',
                'd300',
                'seg',
                'seg-bd',
                'sel',
                'sk',
                'sk-hi',
                'info',
                'info-subtle',
                'success',
                'success-subtle',
                'warning',
                'warning-subtle',
                'danger',
                'danger-subtle',
                'label-green',
                'label-amber',
                'label-purple',
                'label-pink',
                'label-blue',
                'label-gray',
                'label-ink',
                'avatar-1',
                'avatar-2',
                'avatar-3',
                'avatar-4',
                'avatar-5'
            ]
        }
    }
});

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Turns a page's `searchParams` back into a query string (`?a=1&b=2`, or '' when empty).
 * Array values keep their first entry.
 */
export function buildQueryString(
    searchParams?: Record<string, string | string[] | undefined> | null
): string {
    if (!searchParams || Object.keys(searchParams).length === 0) return '';
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
        if (value !== undefined && value !== null) {
            params.set(key, Array.isArray(value) ? value[0] : value);
        }
    }
    const str = params.toString();
    return str ? `?${str}` : '';
}

/** Appends query params to a URL that may already have query params. */
export function appendQueryToUrl(url: string, queryString: string): string {
    if (!queryString) return url;
    const paramsToAppend = queryString.startsWith('?') ? queryString.slice(1) : queryString;
    if (!paramsToAppend) return url;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${paramsToAppend}`;
}
