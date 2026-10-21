import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import MainLayoutLoader from '@components/reusable/mainLayoutLoader';
import { getAuthenticatedUserData } from '@lib/server/authHelpers';
import { shouldLandOnGetStarted } from '@lib/server/gettingStarted';
import { appendQueryToUrl, buildQueryString } from '@lib/utils';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/**
 * `/` works out where a signed-in user lands, server-side so no page flashes first:
 * unfinished onboarding → Get Started for new users → their baseUrl → first workspace's first
 * project (or the not-found pages). Reads the auth cookie, so it renders at request time inside
 * Suspense (Cache Components). Signed-out visitors never get here (proxy.ts sends them to
 * /login), but a failed who-am-i does.
 */
async function RootGate({ searchParams }: { searchParams: SearchParams }): Promise<never> {
    const queryString = buildQueryString(await searchParams);
    const loginUserData = await getAuthenticatedUserData();

    if (!loginUserData) {
        redirect(`/login${queryString}`);
    }
    if (!loginUserData.user?.isOnboarded) {
        redirect(`/user/onboarding${queryString}`);
    }
    if (!loginUserData.user?.isWorkspaceOnboarded) {
        redirect(`/workspace/onboarding${queryString}`);
    }
    if (!loginUserData.user?.isSSOOnboarded && loginUserData.user?.samlFlowId) {
        redirect(`/login/sso/onboarding${queryString}`);
    }

    // New users who haven't logged a bug yet land on Get Started, so the empty dashboard never
    // shows first. A plain landing only: anything in the query (a redirect, a deep-link param)
    // keeps its usual target.
    const landingWorkspaceId = loginUserData.workspaceId || loginUserData.workspaces?.[0]?.id;
    if (!queryString && landingWorkspaceId && (await shouldLandOnGetStarted(landingWorkspaceId))) {
        redirect(`/workspace/${landingWorkspaceId}/get-started`);
    }

    // The user's preferred landing page.
    if (loginUserData.baseUrl?.trim()) {
        redirect(appendQueryToUrl(loginUserData.baseUrl.trim(), queryString));
    }

    const activeWorkspace = loginUserData.workspaces?.[0];
    if (!loginUserData.hasWorkspace || !activeWorkspace?.id) {
        redirect(`/workspace-not-found${queryString}`);
    }

    const activeProject = activeWorkspace.project?.[0];
    if (!activeWorkspace.hasProject || !activeProject?.id) {
        redirect(`/workspace/${activeWorkspace.id}/project-not-found${queryString}`);
    }

    redirect(`/workspace/${activeWorkspace.id}/project/${activeProject.id}${queryString}`);
}

export default function RootPage({ searchParams }: { searchParams: SearchParams }) {
    return (
        <Suspense fallback={<MainLayoutLoader />}>
            <RootGate searchParams={searchParams} />
        </Suspense>
    );
}
