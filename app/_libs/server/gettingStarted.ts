import 'server-only';
import type { GettingStartedStatus } from '@redux/slices/gettingStarted';
import { getAuthCookie } from './authHelpers';

// Server-only: reads the original .env names (never exposed to the browser).
const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT ?? process.env.NEXT_API_ENDPOINT;
const BB_APPLICATION_HEADER =
    process.env.NEXT_PUBLIC_BB_APPLICATION_HEADER ?? process.env.BB_APPLICATION_HEADER ?? '';
const BB_VERSION = process.env.NEXT_PUBLIC_BB_VERSION ?? process.env.BB_VERSION ?? '';

// `/` waits on this before redirecting anywhere, so it gets a short budget.
const LANDING_CHECK_TIMEOUT_MS = 1500;

/**
 * Whether the user should land on Get Started instead of the dashboard: they get the
 * checklist, haven't hidden it or left it via "Go to Dashboard", and haven't logged a bug yet.
 * Someone who has already used the extension (e.g. an existing user creating another
 * workspace, where the step starts over) doesn't need the landing. Any failure or a slow API
 * means "no", so landing never breaks or hangs.
 */
export async function shouldLandOnGetStarted(workspaceId: string): Promise<boolean> {
    try {
        const authCookie = await getAuthCookie();
        const accessToken = authCookie?.session?.accessToken;
        if (!accessToken) {
            return false;
        }

        const response = await fetch(`${API_ENDPOINT}/workspace/${workspaceId}/getting-started`, {
            method: 'GET',
            headers: {
                authorization: `Bearer ${accessToken}`,
                workspace: workspaceId,
                'bb-application': BB_APPLICATION_HEADER,
                'bb-version': BB_VERSION
            },
            cache: 'no-store',
            signal: AbortSignal.timeout(LANDING_CHECK_TIMEOUT_MS)
        });
        if (!response.ok) {
            return false;
        }

        const status = (await response.json()) as GettingStartedStatus;
        const extensionStep = status?.steps?.find((step) => step.key === 'INSTALL_EXTENSION');
        return (
            !!status?.isEligible &&
            !status.isDismissed &&
            !status.skipLanding &&
            !status.hasUsedExtension &&
            extensionStep?.status === 'PENDING'
        );
    } catch (error) {
        console.error('Error checking getting started status:', error);
        return false;
    }
}
