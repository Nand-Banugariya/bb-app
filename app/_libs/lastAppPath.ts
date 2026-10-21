// The last page outside settings, so leaving settings returns there.
const LAST_APP_PATH_KEY = 'bb:lastAppPath';

const isSettingsPath = (path: string) => /\/settings(\/|$|\?)/.test(path);

export const rememberAppPath = (path: string) => {
    if (!path || isSettingsPath(path)) return;
    try {
        sessionStorage.setItem(LAST_APP_PATH_KEY, path);
    } catch {
        // Storage blocked: Back falls back to the project.
    }
};

export const getLastAppPath = (fallback: string) => {
    if (typeof window === 'undefined') return fallback;
    try {
        const stored = sessionStorage.getItem(LAST_APP_PATH_KEY);
        return stored && stored.startsWith('/') && !isSettingsPath(stored) ? stored : fallback;
    } catch {
        return fallback;
    }
};

export { isSettingsPath };
