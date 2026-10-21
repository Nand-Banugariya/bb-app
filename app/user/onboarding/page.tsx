import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getAuthenticatedUserData } from '@lib/server/authHelpers';
import UserOnboardingController from './userOnboarding.controller';
import UserOnboardingSkeleton from './userOnboardingSkeleton';

/**
 * Already-onboarded users skip the form; everyone else gets it with their name prefilled.
 * Reads the auth cookie, so it renders at request time inside Suspense (Cache Components).
 * Signed-out visitors never get here (proxy.ts sends them to /login).
 */
async function UserOnboardingGate() {
    const loginUserData = await getAuthenticatedUserData();
    const user = loginUserData?.user;

    if (user?.isOnboarded) {
        redirect(user.isWorkspaceOnboarded ? '/' : '/workspace/onboarding');
    }

    const defaultName = user?.name?.trim() || user?.email?.split('@')[0] || '';
    return <UserOnboardingController defaultName={defaultName} />;
}

export default function UserOnboardingPage() {
    return (
        <Suspense fallback={<UserOnboardingSkeleton />}>
            <UserOnboardingGate />
        </Suspense>
    );
}
