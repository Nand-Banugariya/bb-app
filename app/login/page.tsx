import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getAuthenticatedUserData } from '@lib/server/authHelpers';
import { buildQueryString } from '@lib/utils';
import LoginController from './login.controller';
import LoginSkeleton from './loginSkeleton';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/**
 * Signed-in visitors never see the form: send them on to where they belong. Reads the auth
 * cookie and search params, so it renders at request time inside Suspense (Cache Components).
 */
async function LoginGate({ searchParams }: { searchParams: SearchParams }) {
    const params = await searchParams;
    const queryString = buildQueryString(params);
    const loginUserData = await getAuthenticatedUserData();

    if (loginUserData) {
        if (!loginUserData.user?.isOnboarded) {
            redirect(`/user/onboarding${queryString}`);
        }
        if (!loginUserData.user?.isWorkspaceOnboarded) {
            redirect(`/workspace/onboarding${queryString}`);
        }
        if (!loginUserData.user?.isSSOOnboarded && loginUserData.user?.samlFlowId) {
            redirect(`/login/sso/onboarding${queryString}`);
        }
        // Already signed in and arriving with a deep link: go straight there (same-origin paths
        // only, never an absolute URL).
        const next = params.next;
        if (
            typeof next === 'string' &&
            next.startsWith('/') &&
            !next.startsWith('//') &&
            !next.startsWith('/login')
        ) {
            redirect(next);
        }
        // `/` works out where to land (Get Started for new users, else their baseUrl or first
        // project), so the dashboard never flashes before a client-side redirect.
        redirect(`/${queryString}`);
    }

    return <LoginController />;
}

export default function LoginPage({ searchParams }: { searchParams: SearchParams }) {
    return (
        <Suspense fallback={<LoginSkeleton />}>
            <LoginGate searchParams={searchParams} />
        </Suspense>
    );
}
