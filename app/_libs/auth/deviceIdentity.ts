/**
 * Per-browser device identity for the opt-in single-active-session auth flow
 * (see /auth/login, /auth/login/github, /auth/login/google, /auth/login/verify-otp on bb-api).
 * Sending `deviceId` on a login call opts that login into session-per-device enforcement +
 * short-lived access tokens; omitting it keeps today's behaviour unchanged. This module is the
 * single source of that id/label pair so every login call site stays in sync automatically
 * (see getLoginDeviceFields, spread into the payload in app/_redux/services/auth.api.ts).
 *
 * Inert on the server and safe to call before the backend change ships — bb-api's
 * ValidationPipe strips unrecognised body fields, so sending these against the current
 * backend is a no-op.
 */

const DEVICE_ID_STORAGE_KEY = 'bb_device_id';

// In-memory fallback for when localStorage is unavailable (private browsing, storage blocked by
// policy, etc). Costs an extra "new device" conflict prompt on the next tab/reload rather than
// silently staying on the legacy flow forever.
let inMemoryDeviceId: string | undefined;

function generateId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
        const bytes = crypto.getRandomValues(new Uint8Array(16));
        return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    }
    // Last-resort fallback (non-secure-context dev hosts without crypto).
    return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
}

/** Stable per-browser id. Creates and persists it on first call. `undefined` on the server. */
export function getDeviceId(): string | undefined {
    if (typeof window === 'undefined') {
        return undefined;
    }

    try {
        const existing = window.localStorage.getItem(DEVICE_ID_STORAGE_KEY);
        if (existing) {
            return existing;
        }
        const created = generateId();
        window.localStorage.setItem(DEVICE_ID_STORAGE_KEY, created);
        return created;
    } catch {
        // localStorage read/write blocked — fall back to an id that's at least stable for the
        // lifetime of this page.
        if (!inMemoryDeviceId) {
            inMemoryDeviceId = generateId();
        }
        return inMemoryDeviceId;
    }
}

// bb-app used ua-parser-js for this label. The label is informational only (shown in the
// "signed in on another device" dialog), so a small ordered match covers it without the
// dependency. Order matters: Edge and Opera UAs also contain "Chrome", Chrome contains "Safari".
const BROWSERS: [RegExp, string][] = [
    [/Edg(e|A|iOS)?\//, 'Edge'],
    [/OPR\/|Opera/, 'Opera'],
    [/SamsungBrowser\//, 'Samsung Internet'],
    [/Firefox\/|FxiOS\//, 'Firefox'],
    [/Chrome\/|CriOS\//, 'Chrome'],
    [/Safari\//, 'Safari']
];
const OPERATING_SYSTEMS: [RegExp, string][] = [
    [/Windows/, 'Windows'],
    [/iPhone|iPad|iPod/, 'iOS'],
    [/Mac OS X|Macintosh/, 'macOS'],
    [/Android/, 'Android'],
    [/CrOS/, 'Chrome OS'],
    [/Linux/, 'Linux']
];

const match = (ua: string, table: [RegExp, string][]) =>
    table.find(([pattern]) => pattern.test(ua))?.[1];

/** Human-readable label, e.g. "Chrome on macOS". `undefined` on the server. */
export function getDeviceLabel(): string | undefined {
    if (typeof window === 'undefined') {
        return undefined;
    }

    try {
        const ua = window.navigator?.userAgent ?? '';
        const browserName = match(ua, BROWSERS);
        const osName = match(ua, OPERATING_SYSTEMS);

        let label: string | undefined;
        if (browserName && osName) {
            label = `${browserName} on ${osName}`;
        } else {
            label = browserName || osName || undefined;
        }

        return label ? label.slice(0, 64) : 'Unknown device';
    } catch {
        return 'Unknown device';
    }
}

/** Spreadable into a login-family request body. `{}` on the server or if no id could be produced. */
export function getLoginDeviceFields(): { deviceId?: string; deviceLabel?: string } {
    const deviceId = getDeviceId();
    if (!deviceId) {
        return {};
    }
    return { deviceId, deviceLabel: getDeviceLabel() };
}
