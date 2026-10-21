/**
 * Shared helpers. Only what the auth / login / SSO flow needs has been ported from bb-app's
 * helpers.tsx so far — add the rest feature by feature as it moves over.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const deepClone = <T = any>(obj: T): T => JSON.parse(JSON.stringify(obj));

const cookieExpirationDate = () => {
    const expirationDate = new Date();
    expirationDate.setTime(expirationDate.getTime() + 2190 * 60 * 60 * 1000);
    return expirationDate;
};

// Name of the lightweight, non-httpOnly cookie shared with the marketing site (betterbugs.io)
// so it can attribute GA4 events to a logged-in user_id. Deliberately separate from the `auth`
// cookie so the marketing site never sees session tokens.
export const BB_UID_COOKIE = 'bb_uid';

// Cross-subdomain cookies only work when both apps share a real parent domain
// (*.betterbugs.io in production/staging). On localhost or any other host, omit `domain` so
// the cookie just falls back to a host-only cookie.
export function getCrossDomainCookieDomain(): string | undefined {
    if (typeof window === 'undefined') return undefined;
    return window.location.hostname.endsWith('betterbugs.io') ? '.betterbugs.io' : undefined;
}

export function getAnalyticsCookieOptions() {
    return {
        path: '/',
        secure: typeof window !== 'undefined' && window.location.protocol === 'https:',
        httpOnly: false,
        expires: cookieExpirationDate(),
        domain: getCrossDomainCookieDomain()
    };
}

export function delete_cookie(name: string, domain?: string) {
    const domainPart = domain ? `; Domain=${domain}` : '';
    document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT${domainPart};`;
}

type ChromeRuntime = {
    runtime?: {
        sendMessage?: (
            extensionId: string,
            message: unknown,
            callback: (response: { isInstalled?: boolean } | undefined) => void
        ) => void;
    };
};

/**
 * Checks whether the BetterBugs browser extension is installed (Chrome and Edge builds).
 * @param chromExtensionId - Chrome extension ID
 * @param edgeExtensionId - Edge extension ID
 * @param onExtensionFound - Called with `true` when either extension answers
 */
export const checkBrowserExtensions = (
    chromExtensionId: string,
    edgeExtensionId: string,
    onExtensionFound: (isInstalled: boolean) => void
) => {
    const chrome = (window as unknown as { chrome?: ChromeRuntime }).chrome;
    const checkExtension = (extensionId: string, browserName: string) => {
        try {
            chrome?.runtime?.sendMessage?.(extensionId, { message: 'isInstalled' }, (response) => {
                if (response?.isInstalled) {
                    onExtensionFound(true);
                }
            });
        } catch (error) {
            console.error(`${browserName} extension check error: `, error);
        }
    };

    checkExtension(chromExtensionId, 'Chrome');
    checkExtension(edgeExtensionId, 'Edge');
};

/** Drops null / undefined / '' / empty-array fields (e.g. optional headers) in place. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const removeEmpty = (obj: Record<string, any>) => {
    for (const key in obj) {
        const value = obj[key];
        if (value == null || value === '' || (Array.isArray(value) && !value.length)) {
            delete obj[key];
        }
    }
    return obj;
};
