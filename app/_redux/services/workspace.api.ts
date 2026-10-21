import { fetch } from '@lib/axiosConfig';
import type { WorkspaceHasUser } from '../models/member';
import type {
    GetAllWorkspaceObject,
    WorkspaceListResponse,
    WorkspaceNewBugCount,
    WorkspaceObject,
    WorkspacePayload,
    WorkspaceSuccessResponse
} from '../models/workspace';

// Onboarding and the endpoints the app shell (sidebar, workspace switcher) needs are ported.
// Workspace settings, billing, SSO and audit-log endpoints move over with their pages.

/** Creates the signed-in user's first workspace (and its first project). */
export const createFirstWorkspaceAPI = async (): Promise<WorkspaceObject> => {
    return fetch({ url: '/workspace/first', method: 'POST' });
};

/** Creates another workspace (workspace switcher → "Create workspace"). */
export const createWorkspaceAPI = async (payload: WorkspacePayload): Promise<WorkspaceObject> => {
    return fetch({ url: '/workspace', method: 'POST', data: payload });
};

export const getAllWorkspaceAPI = async ({
    queryParams,
    authorization,
    workspace
}: GetAllWorkspaceObject): Promise<WorkspaceListResponse> => {
    return fetch({
        url: '/workspace',
        method: 'GET',
        params: queryParams,
        headers: { authorization, workspace }
    });
};

export const getWorkspaceByIdAPI = async ({
    workspaceId
}: {
    workspaceId: string;
}): Promise<WorkspaceObject> => {
    return fetch({ url: `/workspace/${workspaceId}`, method: 'GET' });
};

/** Members who have joined (enabled), for assignee / mention pickers and role checks. */
export const getWorkspaceActiveMemberAPI = async ({
    workspaceId
}: {
    workspaceId: string;
}): Promise<WorkspaceHasUser[]> => {
    return fetch({ url: `/workspace/${workspaceId}/user`, method: 'GET' });
};

/** Every member row, including invited and requested ones (members settings, seat counts). */
export const getWorkspaceAllMemberAPI = async ({
    workspaceId
}: {
    workspaceId: string;
}): Promise<WorkspaceHasUser[]> => {
    return fetch({ url: `/workspace/${workspaceId}/member`, method: 'GET' });
};

/**
 * Per-project "new bugs" counts for the sidebar badge. Kept out of who-am-i, which runs on
 * every session bootstrap.
 */
export const getWorkspaceNewBugCountsAPI = async ({
    workspaceId
}: {
    workspaceId: string;
}): Promise<WorkspaceNewBugCount[]> => {
    return fetch({ url: `/workspace/${workspaceId}/new-bug-count`, method: 'GET' });
};

/* Ported from bb-app as-is ------------------------------------------------------------------- */

export const addSSODomainsAPI = async ({
    workspaceId,
    ssoDomains,
    ssoRole
}: {
    workspaceId: string;
    ssoDomains: string[];
    ssoRole: string;
}): Promise<WorkspaceSuccessResponse> => {
    return fetch({
        url: `/workspace/${workspaceId}/sso`,
        method: 'PATCH',
        data: {
            ssoDomains,
            ssoRole
        }
    });
};

export const updateWorkspaceByID = async (
    payload: WorkspacePayload,
    workspaceId: string | string[]
): Promise<WorkspaceObject> => {
    return fetch({
        url: `/workspace/${workspaceId}`,
        method: 'PATCH',
        data: payload
    });
};

export const enableWorkspace = async (
    workspaceId: string | string[]
): Promise<WorkspaceSuccessResponse> => {
    return fetch({
        url: `/workspace/${workspaceId}/enable`,
        method: 'PUT'
    });
};

export const disableWorkspace = async (
    payload: WorkspacePayload,
    workspaceId: string | string[]
): Promise<WorkspaceSuccessResponse> => {
    return fetch({
        url: `/workspace/${workspaceId}/disable`,
        method: 'PUT'
    });
};

export const getSelectedBugDelete = async ({
    workspaceId,
    projectId,
    bugIds
}: {
    workspaceId: string | string[];
    projectId: string | string[];
    bugIds: string | string[];
}): Promise<WorkspaceObject> => {
    const data = { bugIds: bugIds };
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/bug`,
        method: 'DELETE',
        data: data
    });
};

export const getWorkspaceUsageAPI = async ({
    workspaceId
}: {
    workspaceId: string | string[];
}): Promise<{
    totalStorageBytes: number;
    // null until bb-api's storage backfill has run — the total is then a live
    // estimate, so don't render an "updated at" label from it.
    storageSizeAt: string | null;
}> => {
    return fetch({
        url: `/workspace/${workspaceId}/usage`,
        method: 'GET'
    });
};

export const updateWorkspaceMemberAPI = async ({
    workspaceId,
    userId,
    payload
}: {
    workspaceId: string | string[];
    userId: string | string[];
    payload: { role: string };
}): Promise<WorkspaceSuccessResponse> => {
    return fetch({
        url: `/workspace/${workspaceId}/user/${userId}`,
        method: 'PATCH',
        data: payload
    });
};

export const getWorkspaceTransactionHistoryAPI = async ({
    workspaceId
}: {
    workspaceId: string | string[];
}): Promise<WorkspaceSuccessResponse> => {
    return fetch({
        url: `/workspace/${workspaceId}/subscription/billing-history`,
        method: 'GET'
    });
};

export const getPaymentMethodChangeTransaction = async ({
    workspaceId,
    paddleSubscriptionId
}: {
    workspaceId: string | string[];
    paddleSubscriptionId: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<any> => {
    return fetch({
        url: `/workspace/${workspaceId}/subscription/payment-method-transaction`,
        method: 'POST',
        data: { paddleSubscriptionId }
    });
};

export const cancleWorkspaceSubscriptionAPI = async ({
    workspaceId,
    paddleSubscriptionId,
    cancelImmediately = false
}: {
    workspaceId: string | string[];
    paddleSubscriptionId: string;
    cancelImmediately: boolean;
}): Promise<WorkspaceSuccessResponse> => {
    return fetch({
        url: `/workspace/${workspaceId}/subscription/${paddleSubscriptionId}/cancel`,
        method: 'POST',
        data: { cancelImmediately }
    });
};

export const doNotCancelSubscriptionAPI = async ({
    workspaceId,
    paddleSubscriptionId
}: {
    workspaceId: string | string[];
    paddleSubscriptionId: string;
}): Promise<WorkspaceSuccessResponse> => {
    return fetch({
        url: `/workspace/${workspaceId}/subscription/do-not-cancel`,
        method: 'PATCH',
        data: { paddleSubscriptionId }
    });
};

export const downloadTransactionInvoiceAPI = async ({
    workspaceId,
    paddleTransactionId
}: {
    workspaceId: string | string[];
    paddleTransactionId: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<any> => {
    return fetch({
        url: `/workspace/${workspaceId}/subscription/billing-invoice?transactionId=${paddleTransactionId}`,
        method: 'GET'
    });
};

export const getPaddleAuthTokenAPI = async ({
    workspaceId
}: {
    workspaceId: string | string[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<any> => {
    return fetch({
        url: `/workspace/${workspaceId}/subscription/paddle-auth-token`,
        method: 'GET'
    });
};

export const upgradeWorkspaceSubscriptionAPI = async ({
    workspaceId,
    payload
}: {
    workspaceId: string | string[];
    payload: { maxMembers: number; priceID: string; paddleSubscriptionId: string };
}): Promise<WorkspaceSuccessResponse> => {
    return fetch({
        url: `/workspace/${workspaceId}/subscription/upgrade`,
        method: 'PATCH',
        data: payload
    });
};

export const toggleAutoSyncingAPI = async ({
    workspaceId,
    payload
}: {
    workspaceId: string | string[];
    payload: { value: boolean };
}): Promise<WorkspaceSuccessResponse> => {
    return fetch({
        url: `/workspace/${workspaceId}/sso/automatic-sync-update`,
        method: 'PATCH',
        data: payload
    });
};

export const syncNowAPI = async ({
    workspaceId
}: {
    workspaceId: string | string[];
}): Promise<WorkspaceSuccessResponse> => {
    return fetch({
        url: `/workspace/${workspaceId}/sso/sync-scim-users`,
        method: 'POST'
    });
};

export const getWorkspaceAuditLogsAPI = async ({
    workspaceId,
    queryParams
}: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    workspaceId: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryParams: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<any> => {
    return fetch({
        url: `/workspace/${workspaceId}/audit-logs`,
        method: 'GET',
        params: queryParams
    });
};

export const deleteWorkspaceAPI = async (
    workspaceId: string | string[]
): Promise<WorkspaceSuccessResponse> => {
    return fetch({
        url: `/workspace/${workspaceId}`,
        method: 'DELETE'
    });
};

export const getPreviewPlanDataAPI = async ({
    workspaceId,
    paddleSubscriptionId,
    payload
}: {
    workspaceId: string | string[];
    paddleSubscriptionId: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload: any;
}): Promise<WorkspaceSuccessResponse> => {
    return fetch({
        url: `/workspace/${workspaceId}/subscription/preview`,
        method: 'PATCH',
        data: {
            paddleSubscriptionId,
            payload
        }
    });
};

export const upgradeDowngradePlanAPI = async ({
    workspaceId,
    paddleSubscriptionId,
    payload
}: {
    workspaceId: string | string[];
    paddleSubscriptionId: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload: any;
}): Promise<WorkspaceSuccessResponse> => {
    return fetch({
        url: `/workspace/${workspaceId}/subscription/upgrade-downgrade-plan`,
        method: 'PATCH',
        data: {
            paddleSubscriptionId,
            payload
        }
    });
};

export const transferWorkspaceOwnershipAPI = async (
    workspaceId: string | string[],
    payload: { newOwnerId: string }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> => {
    return fetch({
        url: `/workspace/${workspaceId}/initiate-ownership-transfer`,
        method: 'POST',
        data: payload
    });
};

export const verifyWorkspaceOwnerOtpAPI = async (
    workspaceId: string | string[],
    payload: { newOwnerId: string; otp: string; otpRef: string }
): Promise<WorkspaceSuccessResponse> => {
    return fetch({
        url: `/workspace/${workspaceId}/change-owner`,
        method: 'PATCH',
        data: payload
    });
};

export const resendWorkspaceOwnerOtpAPI = async (
    workspaceId: string | string[],
    payload: { newOwnerId: string }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> => {
    return fetch({
        url: `/workspace/${workspaceId}/resend-ownership-transfer-otp`,
        method: 'POST',
        data: payload
    });
};

export const updateGuestUserApprovalTypeAPI = async (params: {
    workspaceId: string;
    payload: { guestUserApprovalType: 'INSTANT' | 'MANUAL' };
}): Promise<WorkspaceSuccessResponse> => {
    const { workspaceId, payload } = params;
    return fetch({
        url: `/workspace/${workspaceId}/update-guest-user-approval-type`,
        method: 'PATCH',
        data: payload
    });
};

export const approveRoleUpgradeAPI = async ({
    payload,
    workspaceId
}: {
    payload: { requestedToken: string; role: string };
    workspaceId: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<any> => {
    return fetch({
        url: `/workspace/${workspaceId}/approve-role-upgrade`,
        method: 'POST',
        data: payload
    });
};

export const rejectRoleUpgradeAPI = async ({
    payload,
    workspaceId
}: {
    payload: { requestedToken: string; role: string };
    workspaceId: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<any> => {
    return fetch({
        url: `/workspace/${workspaceId}/reject-role-upgrade`,
        method: 'POST',
        data: payload
    });
};

export const requestRoleUpgradeAPI = async ({
    payload,
    workspaceId
}: {
    payload: { requestedRole: string };
    workspaceId: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<any> => {
    return fetch({
        url: `/workspace/${workspaceId}/request-role-upgrade`,
        method: 'POST',
        data: payload
    });
};

export const addBusinessDetailsAPI = async ({
    workspaceId,
    payload
}: {
    workspaceId: string | string[];
    payload: {
        name: string;
        taxId: string;
        companyNumber: string;
    };
}): Promise<WorkspaceSuccessResponse> => {
    return fetch({
        url: `/workspace/${workspaceId}/business`,
        method: 'POST',
        data: payload
    });
};

export const updateBusinessDetailsAPI = async ({
    workspaceId,
    payload
}: {
    workspaceId: string | string[];
    payload: {
        name: string;
        taxId: string;
        companyNumber: string;
    };
}): Promise<WorkspaceSuccessResponse> => {
    return fetch({
        url: `/workspace/${workspaceId}/business`,
        method: 'PATCH',
        data: payload
    });
};

export const getBusinessDetailsAPI = async ({
    workspaceId
}: {
    workspaceId: string | string[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<any> => {
    return fetch({
        url: `/workspace/${workspaceId}/business`,
        method: 'GET'
    });
};

export interface BillingProfileAddress {
    firstLine?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    countryCode?: string;
}

export interface BillingProfilePayload {
    /**
     * The "I'm buying for a business" toggle. `false` removes a saved business —
     * archived in Paddle and cleared server-side. Omitting it leaves any saved
     * business untouched.
     */
    isBusiness?: boolean;
    name?: string;
    taxId?: string;
    companyNumber?: string;
    address?: BillingProfileAddress;
}

/**
 * Returns the saved business + address, used to prefill the billing form shown
 * before every payment and to attach the Paddle IDs to the checkout. Paddle only
 * puts business details on an invoice when the checkout carries them, so this
 * has to be resolved before Checkout.open — not after.
 */
export const getBillingProfileAPI = async ({
    workspaceId
}: {
    workspaceId: string | string[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<any> => {
    return fetch({
        url: `/workspace/${workspaceId}/billing-profile`,
        method: 'GET'
    });
};

export const upsertBillingProfileAPI = async ({
    workspaceId,
    payload
}: {
    workspaceId: string | string[];
    payload: BillingProfilePayload;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<any> => {
    return fetch({
        url: `/workspace/${workspaceId}/billing-profile`,
        method: 'PUT',
        data: payload
    });
};

/*
 * User-scoped twins of the two above. Billing details belong to the person
 * paying, so these work with no workspace in context — which is what workspace
 * creation needs, since the workspace only exists after payment completes.
 * Same request and response shapes as the workspace routes.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getMyBillingProfileAPI = async (): Promise<any> => {
    return fetch({
        url: `/user/me/billing-profile`,
        method: 'GET'
    });
};

export const upsertMyBillingProfileAPI = async ({
    payload
}: {
    payload: BillingProfilePayload;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<any> => {
    return fetch({
        url: `/user/me/billing-profile`,
        method: 'PUT',
        data: payload
    });
};

export const addBillingEmailAPI = async ({
    workspaceId,
    payload
}: {
    workspaceId: string | string[];
    payload: {
        emails: string[];
    };
}): Promise<WorkspaceSuccessResponse> => {
    return fetch({
        url: `/workspace/${workspaceId}/billing-email`,
        method: 'POST',
        data: payload
    });
};

export const deleteBillingEmailAPI = async ({
    workspaceId,
    payload
}: {
    workspaceId: string | string[];
    payload: {
        emails: string[];
    };
}): Promise<WorkspaceSuccessResponse> => {
    return fetch({
        url: `/workspace/${workspaceId}/billing-email`,
        method: 'DELETE',
        data: payload
    });
};

export const disconnectAllIntegrationsAPI = async ({
    workspaceId,
    integrationKey
}: {
    workspaceId: string;
    integrationKey: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<any> => {
    return fetch({
        url: `workspace/${workspaceId}/integrations/${integrationKey}/disconnect-all`,
        method: 'DELETE'
    });
};

export const uploadWorkspaceFilesAPI = async ({
    workspaceId,
    file
}: {
    workspaceId: string | string[];
    file: File;
}): Promise<{ key: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    return fetch({
        url: `/upload/upload-workspace-files/${workspaceId}`,
        method: 'POST',
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

export const getPricePreviewAPI = async ({
    workspaceId
}: {
    workspaceId: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<any> => {
    return fetch({
        url: `/workspace/${workspaceId}/price-preview`,
        method: 'GET'
    });
};

export const updateWorkspaceSecuritySettingsAPI = async ({
    workspaceId,
    payload
}: {
    workspaceId: string | string[];
    payload: {
        extensionSettings: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            dataRedactRegex: any[];
        };
    };
}): Promise<WorkspaceSuccessResponse> => {
    return fetch({
        url: `/workspace/${workspaceId}/preference`,
        method: 'POST',
        data: payload
    });
};

// Updates the workspace-level "show new-bug count in sidebar" preference.
// Hits the shared /preference endpoint, which merges partial payloads — so
// sending only this flag leaves other preferences (e.g. redaction) untouched.
export const updateWorkspaceNewBugCountPreferenceAPI = async ({
    workspaceId,
    isNewBugCountEnabled
}: {
    workspaceId: string | string[];
    isNewBugCountEnabled: boolean;
}): Promise<WorkspaceSuccessResponse> => {
    return fetch({
        url: `/workspace/${workspaceId}/preference`,
        method: 'POST',
        data: { isNewBugCountEnabled }
    });
};

export const sendRecordingLinkEmailAPI = async ({
    workspaceId,
    payload
}: {
    workspaceId: string | string[];
    payload: {
        toEmails: string[];
    };
}): Promise<WorkspaceSuccessResponse> => {
    return fetch({
        url: `/workspace/${workspaceId}/recording-link/send-config`,
        method: 'POST',
        data: payload
    });
};

export const redeemLTDAPI = async ({
    workspaceId,
    payload
}: {
    workspaceId: string | string[];
    payload: { discountCode: string };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<any> => {
    return fetch({
        url: `/workspace/${workspaceId}/redeem-prime-club-discount`,
        method: 'POST',
        data: payload
    });
};

// ── Workspace invite link ───────────────────────────────────────────────────
// The API returns the raw token; the shareable URL is composed on this side
// from the app's own origin, so the link always points at the environment the
// admin is looking at rather than at whatever base URL the API was configured
// with.

export type WorkspaceInviteLink = {
    token: string | null;
    role: 'ADMIN' | 'MEMBER' | 'GUEST';
    isEnabled: boolean;
    /** Chosen lifetime in days; `null` means the link never expires. */
    expiresInDays: number | null;
    /** When the current token was minted — creation, or the last reset. */
    generatedAt: string | null;
    expireAt: string | null;
    isExpired: boolean;
};

export const getWorkspaceInviteLinkAPI = async ({
    workspaceId
}: {
    workspaceId: string;
}): Promise<WorkspaceInviteLink> => {
    return fetch({
        url: `/workspace/${workspaceId}/invite-link`,
        method: 'GET'
    });
};

// Both fields are optional server-side: the toggle sends `isEnabled`, the
// lifetime dropdown sends `expiresInDays`, and whatever is omitted keeps its
// current value. `expiresInDays: null` is a real choice (never expires), so it
// has to be sent explicitly rather than left out.
export const updateWorkspaceInviteLinkAPI = async ({
    workspaceId,
    isEnabled,
    expiresInDays
}: {
    workspaceId: string;
    isEnabled?: boolean;
    expiresInDays?: number | null;
}): Promise<WorkspaceInviteLink> => {
    return fetch({
        url: `/workspace/${workspaceId}/invite-link`,
        method: 'PATCH',
        data: {
            ...(isEnabled !== undefined && { isEnabled }),
            ...(expiresInDays !== undefined && { expiresInDays })
        }
    });
};

export const resetWorkspaceInviteLinkAPI = async ({
    workspaceId
}: {
    workspaceId: string;
}): Promise<WorkspaceInviteLink> => {
    return fetch({
        url: `/workspace/${workspaceId}/invite-link/reset`,
        method: 'POST'
    });
};
