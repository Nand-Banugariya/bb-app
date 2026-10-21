import type { AuthHeaderParams } from './auth';
import type { QueryParams } from './common';
import type { WorkspaceHasUser } from './member';
import type { PaymentMethodDetails, ProjectObject } from './project';

export type WorkspaceSubscriptionPlan = 'FREE' | 'PRO' | 'TEAM' | 'ENTERPRISE';

export type WorkspaceSubscriptionStatus =
    | 'FREE_TRIAL'
    | 'ACTIVE'
    | 'PAYMENT_DUE'
    | 'CANCELLED'
    | 'SCHEDULED_CANCELLED';

export interface SubscriptionPlan {
    name: string;
    scopes: string[];
    guestUserScopes: string[];
}

export interface WorkspaceHasSubscription {
    id: string;
    workspaceId: string;
    subscriptionPlanId: WorkspaceSubscriptionPlan;
    status: WorkspaceSubscriptionStatus;
    subscriptionPlan: SubscriptionPlan;
    customScopes: string[];
    maxMembers: number;
    maxProjects?: number | null;
    planMemberCap: number;
    ltdPlanId?: string;
    ltdOrderId?: string;
    allocatedGuestMembers: number;
    dataRetentionDays: number;
    maxSessionsPerMonth?: number | null;
    /** Sessions the workspace can still create (monthly remainder + bonus pool). Gate on this. */
    remainingSessions?: number | null;
    /** The split of `remainingSessions`, for display. The bonus is spent first. */
    monthlyRemainingSessions?: number | null;
    bonusSessions?: number;
    /** AI credit ceiling for the workspace; null = unlimited (e.g. ENTERPRISE). */
    maxAiCredits?: number | null;
    maxAiTokens?: number | null;
    maxIntegrationCredits?: number | null;
    maxRecordingLinks?: number | null;
    consumedRecordingLinks?: number | null;
    paddleSubscriptionId?: string;
    paddlePriceId?: string;
    eventType?: string;
    paddleStatus?: string;
    discount?: string;
    userId?: string;
    paddleCustomerId?: string;
    nextBilledAt?: string;
    paddleBillingCycle?: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface WorkspacePreference {
    extensionSettings?: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dataRedactRegex: any[];
    };
    isBugManagementEnabled?: boolean;
    isNewBugCountEnabled?: boolean;
}

/**
 * Workspace as returned by who-am-i and the workspace endpoints. Only the core fields are
 * guaranteed; the rest depend on the endpoint and the caller's role.
 */
export interface WorkspaceObject {
    id: string;
    name: string;
    logo: string;
    status: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    baseUrl: string;
    /** Projects the user can open (archived ones excluded). */
    project: ProjectObject[];
    /** Same as `project` but with archived projects included. */
    allProject?: ProjectObject[];
    /** Private projects the user can't open, as masked stubs (`isAccessible: false`). */
    inaccessibleProjects?: ProjectObject[];
    maxProjects?: number | null;
    activeProjectsCount?: number;
    role: string;
    isOwner: boolean;
    hasProject?: boolean;
    industry?: string;
    companySize?: string;
    companyLocation?: string;
    ssoDomains?: string[];
    ssoRole?: string;
    guestUserApprovalType?: 'INSTANT' | 'MANUAL';
    enterpriseSSODomains?: string[];
    enterpriseSSO?: {
        isSSOSetedup: boolean;
        isSCIMSetedup: boolean;
        isSyncing: boolean;
        lastSyncedAt: string;
        organizationId: string;
        base_url: string;
    };
    isSCIMEnabled?: boolean;
    paymentMethodDetails?: PaymentMethodDetails;
    workspaceHasSubscription?: WorkspaceHasSubscription[];
    isBillingEnabled?: boolean;
    paddleCustomerId?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    userHasPreference?: any[];
    workspaceHasUser?: WorkspaceHasUser[];
    workspaceHasPreference?: WorkspacePreference[];
    workspaceBusinessProfile?: {
        name: string;
        taxId: string;
        companyNumber: string;
    };
    bussinessEmails?: string[];
}

/** List response of GET /workspace. */
export interface WorkspaceListResponse {
    list: WorkspaceObject[];
    total?: number;
    count?: number;
    hasMany?: boolean;
}

export interface GetAllWorkspaceObject extends AuthHeaderParams {
    queryParams?: QueryParams;
    workspace?: string;
}

export interface WorkspacePayload {
    name?: string;
    logo?: string;
    companyLocation?: string;
    companySize?: string;
    industry?: string;
}

export interface WorkspaceNewBugCount {
    projectId: string;
    newBugsCount: number;
}

/* Workspace onboarding --------------------------------------------------------------------- */

/** Response of PATCH /auth/update-onboarding (join or request access). */
export interface UpdateOnboardingResponse {
    user?: { id?: string; email?: string; name?: string };
    session?: { id?: string; accessToken?: string };
    workspaceId?: string;
    projectId?: string;
    baseUrl?: string;
}

/** bb-app's loose response type for workspace endpoints whose shape isn't modelled yet. */
export interface WorkspaceSuccessResponse {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
    url?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}
