/**
 * Public runtime config, safe to ship to the browser.
 *
 * Every value here is exposed by the explicit allowlist in next.config.ts, which maps the
 * existing .env names (bb-app's NEXT_API_ENDPOINT, GOOGLE_CLIENT_ID, …) to NEXT_PUBLIC_* names.
 * Secrets (BASIC_AUTH_*, BB_API_KEY, GLEAP_SECRET, …) are never listed there, so they never
 * reach the client bundle. Each reference is a static `process.env.NEXT_PUBLIC_X` so Next can
 * inline it at build time — don't read these dynamically.
 *
 * Server-only code (proxy.ts, app/_libs/server/*) may read the original names directly.
 */
export const env = {
    /** LOCAL | FIREFLY (dev) | DRAGONFLY (staging) | BUTTERFLY (production) */
    appEnv: process.env.NEXT_PUBLIC_ENV ?? '',
    /** This app's own origin, e.g. https://app.betterbugs.io */
    appUrl: process.env.NEXT_PUBLIC_ENDPOINT ?? '',
    /** bb-api base URL */
    apiEndpoint: process.env.NEXT_PUBLIC_API_ENDPOINT ?? '',
    socketServerUrl: process.env.NEXT_PUBLIC_SOCKET_SERVER_URL ?? '',
    enableCaptcha: Boolean(parseInt(process.env.NEXT_PUBLIC_ENABLE_CAPTCHA ?? '', 10)),
    captchaSiteKey: process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY ?? '',
    githubClientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID ?? '',
    githubRedirectUri: process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI ?? '',
    googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '',
    googleRedirectUri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI ?? '',
    s3ImagePath: process.env.NEXT_PUBLIC_S3_IMAGE_PATH ?? '',
    /** Sent as the `bb-application` header on every API call. */
    bbApplicationHeader: process.env.NEXT_PUBLIC_BB_APPLICATION_HEADER ?? '',
    /** Sent as the `bb-version` header on every API call. */
    bbVersion: process.env.NEXT_PUBLIC_BB_VERSION ?? ''
} as const;
