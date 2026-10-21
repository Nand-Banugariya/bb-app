import type { NextConfig } from 'next';

/**
 * Values the browser may see, mapped from the existing .env names (bb-app's NEXT_API_ENDPOINT,
 * GOOGLE_CLIENT_ID, …) to NEXT_PUBLIC_* names. A NEXT_PUBLIC_* value in the environment wins,
 * so either naming works. This is an explicit allowlist: secrets such as BASIC_AUTH_*,
 * BB_API_KEY or GLEAP_SECRET are never listed and so never reach the client bundle (bb-app's
 * config exposed the whole .env). Client code reads these through app/_libs/env.ts.
 */
const publicEnv = (name: string, legacyName: string) =>
    process.env[name] ?? process.env[legacyName] ?? '';

const nextConfig: NextConfig = {
    env: {
        NEXT_PUBLIC_ENV: publicEnv('NEXT_PUBLIC_ENV', 'NEXT_ENV'),
        NEXT_PUBLIC_ENDPOINT: publicEnv('NEXT_PUBLIC_ENDPOINT', 'NEXT_ENDPOINT'),
        NEXT_PUBLIC_API_ENDPOINT: publicEnv('NEXT_PUBLIC_API_ENDPOINT', 'NEXT_API_ENDPOINT'),
        NEXT_PUBLIC_SOCKET_SERVER_URL: publicEnv(
            'NEXT_PUBLIC_SOCKET_SERVER_URL',
            'SOCKET_SERVER_URL'
        ),
        NEXT_PUBLIC_ENABLE_CAPTCHA: publicEnv('NEXT_PUBLIC_ENABLE_CAPTCHA', 'ENABLE_CAPTCHA'),
        NEXT_PUBLIC_CAPTCHA_SITE_KEY: publicEnv('NEXT_PUBLIC_CAPTCHA_SITE_KEY', 'CAPTCHA_SITE_KEY'),
        NEXT_PUBLIC_GITHUB_CLIENT_ID: publicEnv('NEXT_PUBLIC_GITHUB_CLIENT_ID', 'GITHUB_CLIENT_ID'),
        NEXT_PUBLIC_GITHUB_REDIRECT_URI: publicEnv(
            'NEXT_PUBLIC_GITHUB_REDIRECT_URI',
            'GITHUB_REDIRECT_URI'
        ),
        NEXT_PUBLIC_GOOGLE_CLIENT_ID: publicEnv('NEXT_PUBLIC_GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_ID'),
        NEXT_PUBLIC_GOOGLE_REDIRECT_URI: publicEnv(
            'NEXT_PUBLIC_GOOGLE_REDIRECT_URI',
            'GOOGLE_REDIRECT_URI'
        ),
        NEXT_PUBLIC_S3_IMAGE_PATH: publicEnv('NEXT_PUBLIC_S3_IMAGE_PATH', 'S3_IMAGE_PATH'),
        NEXT_PUBLIC_BB_APPLICATION_HEADER: publicEnv(
            'NEXT_PUBLIC_BB_APPLICATION_HEADER',
            'BB_APPLICATION_HEADER'
        ),
        NEXT_PUBLIC_BB_VERSION: publicEnv('NEXT_PUBLIC_BB_VERSION', 'BB_VERSION')
    },
    experimental: {
        agentFeedback: true
    },
    cacheComponents: true,
    partialPrefetching: true,
    turbopack: {
        rules: {
            '*.css': {
                loaders: ['@tailwindcss/turbopack'],
                as: '*.css'
            }
        }
    }
};

export default nextConfig;
