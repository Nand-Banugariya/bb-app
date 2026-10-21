'use client';

import * as React from 'react';
import {
    applyTheme,
    DEFAULT_THEME_PREFERENCE,
    isThemePreference,
    resolveTheme,
    SYSTEM_DARK_QUERY,
    THEME_STORAGE_KEY,
    type ResolvedTheme,
    type ThemePreference
} from '@lib/themeInit';

type ThemeContextValue = {
    /** What the user picked: LIGHT, DARK or SYSTEM. */
    preference: ThemePreference;
    /** What is actually showing. */
    resolvedTheme: ResolvedTheme;
    setPreference: (preference: ThemePreference) => void;
};

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

// Same-tab writes don't fire `storage`, so the store announces its own changes.
const PREFERENCE_EVENT = 'bb-theme-preference';

const readPreference = (): ThemePreference => {
    try {
        const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
        return isThemePreference(stored) ? stored : DEFAULT_THEME_PREFERENCE;
    } catch {
        return DEFAULT_THEME_PREFERENCE;
    }
};

const subscribePreference = (onChange: () => void) => {
    window.addEventListener('storage', onChange);
    window.addEventListener(PREFERENCE_EVENT, onChange);
    return () => {
        window.removeEventListener('storage', onChange);
        window.removeEventListener(PREFERENCE_EVENT, onChange);
    };
};

const subscribeSystem = (onChange: () => void) => {
    const mql = window.matchMedia(SYSTEM_DARK_QUERY);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
};

/**
 * Light / Dark / System theme. The stored preference is applied before first paint by
 * THEME_INIT_SCRIPT in app/layout.tsx; this provider keeps <html> in sync afterwards (picker,
 * other tabs, OS theme changes while on System).
 */
function ThemeProvider({ children }: { children: React.ReactNode }) {
    const preference = React.useSyncExternalStore(
        subscribePreference,
        readPreference,
        () => DEFAULT_THEME_PREFERENCE
    );
    const systemDark = React.useSyncExternalStore(
        subscribeSystem,
        () => window.matchMedia(SYSTEM_DARK_QUERY).matches,
        () => false
    );
    const resolvedTheme = resolveTheme(preference, systemDark);

    React.useEffect(() => {
        applyTheme(resolvedTheme);
    }, [resolvedTheme]);

    const setPreference = React.useCallback((next: ThemePreference) => {
        try {
            window.localStorage.setItem(THEME_STORAGE_KEY, next);
        } catch {
            // Storage blocked (private mode): the theme still applies for this page view.
        }
        window.dispatchEvent(new Event(PREFERENCE_EVENT));
    }, []);

    const value = React.useMemo(
        () => ({ preference, resolvedTheme, setPreference }),
        [preference, resolvedTheme, setPreference]
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

function useTheme() {
    const context = React.useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within a ThemeProvider.');
    return context;
}

/** Just the theme that is showing ('light' | 'dark'), e.g. for picking a logo variant. */
function useResolvedTheme() {
    return useTheme().resolvedTheme;
}

export { ThemeProvider, ThemeContext, useTheme, useResolvedTheme };
export type { ThemeContextValue };
