import { fetch } from '@lib/axiosConfig';
import { getLoginDeviceFields } from '@lib/auth/deviceIdentity';
import type {
    AuthHeaderParams,
    InvitationPayload,
    RequestPayload,
    SocialLoginPayload
} from '../models/auth';
import type {
    UpdateOnboardingResponse,
    WorkspacePayload,
    WorkspaceSuccessResponse
} from '../models/workspace';
import type { LoginDataResponse, LoginPayload } from '../slices/auth';

// The auth / login / SSO, user-onboarding and workspace-onboarding endpoints have been ported
// from bb-app so far. Accept-request, invite-link, profile and preference endpoints move over
// with their pages.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const removeEmpty = (obj: Record<string, any>) => {
    for (const propName in obj) {
        if (
            obj[propName] === null ||
            obj[propName] === undefined ||
            obj[propName] === '' ||
            (Array.isArray(obj[propName]) && !obj[propName].length)
        ) {
            delete obj[propName];
        }
    }
    return obj;
};

// Sending deviceId/deviceLabel opts a login into bb-api's single-active-session +
// short-lived-access-token flow; omitting them (the pre-existing backend) is a no-op, so this
// is safe to send unconditionally. withCredentials is required so the app+API's
// cross-subdomain httpOnly refresh cookie (bb_refresh_token) actually gets stored by the
// browser on a successful login. See app/_libs/auth/deviceIdentity.ts.
export const loginAPI = async (payload: LoginPayload): Promise<LoginDataResponse> => {
    return fetch({
        url: '/auth/login',
        method: 'POST',
        data: { ...payload, ...getLoginDeviceFields() },
        withCredentials: true
    });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const githubLoginAPI = async (payload: SocialLoginPayload): Promise<any> => {
    return fetch({
        url: '/auth/login/github',
        method: 'POST',
        data: { ...payload, ...getLoginDeviceFields() },
        withCredentials: true
    });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const googleLoginAPI = async (payload: SocialLoginPayload): Promise<any> => {
    return fetch({
        url: '/auth/login/google',
        method: 'POST',
        data: { ...payload, ...getLoginDeviceFields() },
        withCredentials: true
    });
};

/** who-am-i: the signed-in user, their workspaces and landing URL. */
export const getLoginUser = async ({
    authorization
}: AuthHeaderParams): Promise<LoginDataResponse> => {
    return fetch({
        url: `auth/who-am-i`,
        method: 'GET',
        // Bound the request so a stalled who-am-i rejects instead of hanging the session-restore
        // path. Callers must treat a non-401 failure as transient and NOT log the user out.
        timeout: 20000,
        headers: removeEmpty({ authorization })
    });
};

export const logoutAPI = async ({
    sessionId,
    reason
}: {
    sessionId: string;
    reason?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<any> => {
    // `reason` is a query param (the backend ignores unknown params) so automatic/unexpected
    // logouts are filterable by request URL, e.g. 'reason=whoami_unauthorized'. User-initiated
    // logouts omit it. withCredentials so a managed session's refresh cookie is sent (and
    // bb-api's server-side clear of it takes effect).
    const url = reason ? `/auth/logout?reason=${encodeURIComponent(reason)}` : `/auth/logout`;
    return fetch({ url, method: 'POST', data: { sessionId }, withCredentials: true });
};

export const otpVerificationAPI = async (payload: {
    otp: number;
    otpRef: string | undefined;
    invitationToken?: string | null;
    requestToken?: string | null;
    utmSourceToken?: string | null;
    // Invite-link tokens (`/join/<token>`, `/join-project/<token>`). bb-api echoes them back on
    // the login response so the client still knows where to land after a SESSION_CONFLICT
    // confirm round-trip.
    inviteLinkToken?: string | null;
    projectInviteLinkToken?: string | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<any> => {
    return fetch({
        url: '/auth/login/verify-otp',
        method: 'POST',
        data: { ...payload, ...getLoginDeviceFields() },
        withCredentials: true
    });
};

// Rejoins a login that hit a SESSION_CONFLICT (409) after the user confirmed they want to sign
// the other device out. Same success response shape as the original login call (including
// expiresIn + the refresh cookie).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const loginConfirmAPI = async (payload: { confirmationToken: string }): Promise<any> => {
    return fetch({
        url: '/auth/login/confirm',
        method: 'POST',
        data: payload,
        withCredentials: true
    });
};

export const resendOtpAPI = async (payload: {
    userId: string;
    otpRef: string | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<any> => {
    return fetch({ url: '/auth/login/resend-otp', method: 'POST', data: payload });
};

/** Sign-in support: a short-lived session handed over from the admin panel (?sessionId=). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const loginFromAdminAPI = async (payload: { sessionId: string }): Promise<any> => {
    return fetch({ url: '/auth/login-from-admin', method: 'POST', data: payload });
};

export const verifySSOEmailAPI = async (payload: {
    email: string;
    // Put into the SAML RelayState by bb-api, which is the only thing that survives the round
    // trip out to the customer's IdP and back.
    inviteLinkToken?: string | null;
    projectInviteLinkToken?: string | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<any> => {
    return fetch({ url: '/sso/verify-sso-email', method: 'POST', data: payload });
};

export const redeemSSOUserDataAPI = async (payload: {
    accessToken: string;
    email: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<any> => {
    return fetch({ url: '/sso/redeem-sso-user-data', method: 'POST', data: payload });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateSSOOnboarding = async (payload: { accessToken: string }): Promise<any> => {
    // Workspace-independent route: an SSO user may not have an active workspace yet, so the
    // endpoint must not depend on a workspaceId.
    return fetch({
        url: '/sso/update-sso-onboarding',
        method: 'PATCH',
        headers: removeEmpty({ authorization: 'Bearer ' + payload.accessToken })
    });
};

/* User onboarding ---------------------------------------------------------------------------- */

/** Profile answers from the onboarding form; bb-api stores them and marks the user onboarded. */
export interface OnboardingUserDataPayload {
    name?: string;
    companyLocation?: string;
    companySize?: string;
    industry?: string;
    companyName?: string;
    companyRole?: string;
    PMTools?: string[];
    heardFrom?: string;
}

export const updateOnboardingUserDataAPI = async (
    payload: OnboardingUserDataPayload
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> => {
    return fetch({ url: '/auth/update-onboarding-user-data', method: 'PATCH', data: payload });
};

/** Workspaces the user can join: matching their email domain, or that invited them. */
export interface OnboardingWorkspacesResponse {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    domainWorkspaces?: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    invitedWorkspaces?: any[];
}

export const getOnboardingUserWorkspacesAPI = async (): Promise<OnboardingWorkspacesResponse> => {
    return fetch({ url: '/workspace/domain-workspaces', method: 'GET' });
};

/* Workspace onboarding ----------------------------------------------------------------------- */

/**
 * Joins the given domain workspaces, or requests access where the workspace approves joiners
 * manually. Marks the user workspace-onboarded.
 */
export const updateOnboardingAPI = async ({
    workspaceIds,
    utmSourceToken,
    authorization
}: {
    workspaceIds: string[];
    utmSourceToken?: string | null;
    authorization?: string;
}): Promise<UpdateOnboardingResponse> => {
    return fetch({
        url: '/auth/update-onboarding',
        method: 'PATCH',
        data: { workspaceIds, utmSourceToken },
        headers: removeEmpty({ authorization })
    });
};

/** Accepts a workspace invitation (onboarding's "Invitations" list, /invite-user). */
export const acceptInvitationAPI = async ({
    payload,
    authorization
}: {
    payload: InvitationPayload;
    authorization?: string;
}): Promise<UpdateOnboardingResponse> => {
    return fetch({
        url: '/auth/accept-invitation',
        method: 'POST',
        data: payload,
        headers: removeEmpty({ authorization })
    });
};

/* Ported from bb-app as-is ------------------------------------------------------------------- */

export const verifyInvitationTokenAPI = async ({
    payload,
    authorization
}: {
    payload: InvitationPayload;
    authorization: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<any> => {
    return fetch({
        url: '/auth/verify-invitation-token',
        method: 'POST',
        data: payload,
        headers: removeEmpty({ authorization: authorization })
    });
};

export const verifyRequestTokenAPI = async ({
    payload,
    authorization
}: {
    payload: RequestPayload;
    authorization: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<any> => {
    return fetch({
        url: '/auth/verify-request-token',
        method: 'POST',
        data: payload,
        headers: removeEmpty({ authorization: authorization })
    });
};

export const acceptRequestAPI = async ({
    payload,
    authorization
}: {
    payload: RequestPayload;
    authorization: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<any> => {
    return fetch({
        url: '/auth/accept-request',
        method: 'POST',
        data: payload,
        headers: removeEmpty({ authorization: authorization })
    });
};

export const rejectRequestAPI = async ({
    payload,
    authorization
}: {
    payload: RequestPayload;
    authorization: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<any> => {
    return fetch({
        url: '/auth/reject-request',
        method: 'POST',
        data: payload,
        headers: removeEmpty({ authorization: authorization })
    });
};

export const rejectInvitationAPI = async ({
    payload,
    authorization
}: {
    payload: InvitationPayload;
    authorization: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<any> => {
    return fetch({
        url: '/auth/reject-invitation',
        method: 'POST',
        data: payload,
        headers: removeEmpty({ authorization: authorization })
    });
};

export const updateProfile = async (
    payload: WorkspacePayload
): Promise<WorkspaceSuccessResponse> => {
    return fetch({ url: `/auth/profile`, method: 'PATCH', data: payload });
};

export const leaveWorkspaceAPI = async (workspaceID: string) => {
    return fetch({ url: `/auth/leave-workspace/${workspaceID}`, method: 'DELETE' });
};

export const getRequestWorkspacesAPI = async ({ authorization }: { authorization?: string }) => {
    return fetch({ url: `/auth/requested-workspaces`, method: 'GET' });
};

export const requestSSOJoin = async ({
    workspaceIds,
    authorization
}: {
    workspaceIds: string[];
    authorization?: string;
}) => {
    return fetch({
        url: `/auth/request-sso-join`,
        method: 'PATCH',
        data: { workspaceIds },
        headers: removeEmpty({ authorization: authorization })
    });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const submitSpecificIssueAPI = async (payload: { issue: string }): Promise<any> => {
    return fetch({ url: '/auth/specific-issue', method: 'POST', data: payload });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getPMToolsAPI = async (): Promise<any> => {
    return fetch({ url: '/auth/list-pm-tools', method: 'GET' });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sendOtpToOldEmailForChangeAPI = async (): Promise<any> => {
    return fetch({ url: '/auth/send-otp-to-old-email-for-change', method: 'POST' });
};

export const verifyOtpToOldEmailForChangeAPI = async (payload: {
    otp: string;
    otpRef: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<any> => {
    return fetch({
        url: '/auth/verify-otp-to-old-email-for-change',
        method: 'POST',
        data: payload
    });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const initChangeEmailAPI = async (payload: { email: string }): Promise<any> => {
    return fetch({ url: '/auth/init-change-email', method: 'POST', data: payload });
};

export const completeChangeEmailAPI = async (payload: {
    otp: string;
    otpRef: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<any> => {
    return fetch({ url: '/auth/complete-change-email', method: 'POST', data: payload });
};

export const updateUIThemePreferenceAPI = async (payload: {
    themePreference: 'LIGHT' | 'DARK' | 'SYSTEM';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<any> => {
    return fetch({ url: '/auth/update-ui-theme-preference', method: 'PATCH', data: payload });
};

// The sidebar's layout, saved on the user (not per workspace). Send only the
// fields that changed.
export interface SidebarPreference {
    isCollapsed?: boolean;
    isProjectsCollapsed?: boolean;
    isFavouritesCollapsed?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateSidebarPreferenceAPI = async (payload: SidebarPreference): Promise<any> => {
    return fetch({ url: '/auth/update-sidebar-preference', method: 'PATCH', data: payload });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const deleteUserAPI = async (): Promise<any> => {
    return fetch({ url: '/auth/delete-user', method: 'DELETE' });
};

export const getNotificationPreferencesAPI = async (): Promise<{
    userId: string;
    optedOutTypes: string[];
    availableTypes: string[];
}> => {
    return fetch({ url: '/user/me/notification-preferences', method: 'GET' });
};

export const updateNotificationPreferencesAPI = async (payload: {
    optOutTypes: string[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<any> => {
    return fetch({ url: '/user/me/notification-preferences', method: 'PUT', data: payload });
};

export const verifyInviteLinkAPI = async ({
    payload,
    authorization
}: {
    payload: { inviteLinkToken: string };
    authorization: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<any> => {
    return fetch({
        url: '/auth/verify-invite-link',
        method: 'POST',
        data: payload,
        headers: removeEmpty({ authorization: authorization })
    });
};

export const joinWithInviteLinkAPI = async ({
    payload,
    authorization
}: {
    payload: { inviteLinkToken: string };
    authorization: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<any> => {
    return fetch({
        url: '/auth/join-with-invite-link',
        method: 'POST',
        data: payload,
        headers: removeEmpty({ authorization: authorization })
    });
};

export const verifyProjectInviteLinkAPI = async ({
    payload,
    authorization
}: {
    payload: { inviteLinkToken: string };
    authorization: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<any> => {
    return fetch({
        url: '/auth/verify-project-invite-link',
        method: 'POST',
        data: payload,
        headers: removeEmpty({ authorization: authorization })
    });
};

export const joinProjectWithInviteLinkAPI = async ({
    payload,
    authorization
}: {
    payload: { inviteLinkToken: string };
    authorization: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<any> => {
    return fetch({
        url: '/auth/join-project-with-invite-link',
        method: 'POST',
        data: payload,
        headers: removeEmpty({ authorization: authorization })
    });
};
