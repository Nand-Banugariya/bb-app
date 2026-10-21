/**
 * Theme preference shared by the pre-paint script (app/layout.tsx) and ThemeProvider.
 * The preference is LIGHT, DARK or SYSTEM (follows the OS). The resolved theme is applied as
 * a `light` / `dark` class on <html>, which globals.css keys the design tokens on.
 */

export type ThemePreference = 'LIGHT' | 'DARK' | 'SYSTEM';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'themePreference';
export const DEFAULT_THEME_PREFERENCE: ThemePreference = 'SYSTEM';
export const SYSTEM_DARK_QUERY = '(prefers-color-scheme: dark)';

export const isThemePreference = (value: unknown): value is ThemePreference =>
    value === 'LIGHT' || value === 'DARK' || value === 'SYSTEM';

export const resolveTheme = (preference: ThemePreference, systemDark: boolean): ResolvedTheme =>
    preference === 'DARK' || (preference === 'SYSTEM' && systemDark) ? 'dark' : 'light';

/** Puts the resolved theme on <html>. Safe to call repeatedly. */
export const applyTheme = (theme: ResolvedTheme) => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.classList.toggle('light', theme === 'light');
    root.style.colorScheme = theme;
};

/**
 * Inline script for <head>: applies the stored theme before first paint so the page never
 * flashes the wrong theme. Keep it dependency-free; it runs before React.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var p=localStorage.getItem('${THEME_STORAGE_KEY}');if(p!=='LIGHT'&&p!=='DARK'&&p!=='SYSTEM')p='${DEFAULT_THEME_PREFERENCE}';var d=p==='DARK'||(p==='SYSTEM'&&window.matchMedia('${SYSTEM_DARK_QUERY}').matches);var r=document.documentElement;r.classList.add(d?'dark':'light');r.style.colorScheme=d?'dark':'light';}catch(e){}})();`;
