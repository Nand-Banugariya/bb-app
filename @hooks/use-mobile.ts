import * as React from 'react';

/**
 * Design system v2 breakpoints (keep in sync with --breakpoint-* in app/globals.css).
 * Mobile < 640 · Tablet 640–1023 · Desktop 1024–1279 · LG 1280 · XL 1440 · 2XL 1920 · 3XL 2200 · 4XL 2560
 */
export const BREAKPOINTS = {
    sm: 640, // Tablet
    md: 1024, // Desktop
    lg: 1280, // LG
    xl: 1440, // XL
    '2xl': 1920, // 2XL
    '3xl': 2200, // 3XL
    '4xl': 2560 // 4XL
} as const;

/** Subscribes to a media query. Always false during SSR. */
export function useMediaQuery(query: string) {
    const subscribe = React.useCallback(
        (onChange: () => void) => {
            const mql = window.matchMedia(query);
            mql.addEventListener('change', onChange);
            return () => mql.removeEventListener('change', onChange);
        },
        [query]
    );
    return React.useSyncExternalStore(
        subscribe,
        () => window.matchMedia(query).matches,
        () => false
    );
}

/** Mobile: below 640px. Sidebar becomes a drawer, menus open as bottom sheets. */
export function useIsMobile() {
    return useMediaQuery(`(max-width: ${BREAKPOINTS.sm - 1}px)`);
}

/** Tablet: 640–1023px. Sidebar collapses to a 64px icon rail. */
export function useIsTablet() {
    return useMediaQuery(
        `(min-width: ${BREAKPOINTS.sm}px) and (max-width: ${BREAKPOINTS.md - 1}px)`
    );
}
