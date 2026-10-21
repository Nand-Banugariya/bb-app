import type { AuthHeaderParams } from './auth';
import type { QueryParams } from './common';

export interface ShortUserInfoObject {
    id: string;
    email: string;
    name: string;
    image: string;
}

export interface ProjectHasUser {
    id: string;
    projectId: string;
    userId: string;
    isWorkspaceOwner: boolean;
    isCreator: boolean;
    role: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    user: ShortUserInfoObject;
}

/** A pending request to join a private project (a ProjectHasUser row with status REQUESTED). */
export interface ProjectAccessRequest {
    id: string;
    projectId?: string;
    status: 'REQUESTED' | 'ENABLED' | 'DISABLED';
    requestedAt?: string;
    expireAt?: string;
}

/**
 * Who to ask for access to a private project the user can't open. `relation` says which flag
 * matched, since there is no OWNER project role.
 */
export interface ProjectStubOwner {
    id: string;
    name: string;
    email: string;
    image: string;
    relation?: 'CREATOR' | 'WORKSPACE_OWNER' | 'ADMIN';
}

/** Web SDK "Compose Email" template (the customer resolution email). */
export interface ResolutionEmailTemplate {
    subject?: string;
    body?: string;
}

/**
 * Project as returned by who-am-i and the project endpoints. Private projects the user can't
 * open come back as stubs (`isAccessible: false`) with only display fields plus `owner`,
 * `accessRequest` and the notify counts.
 */
export interface ProjectObject {
    id: string;
    name: string;
    image: string;
    role: string;
    status: string;
    workspaceId: string;
    isDeleted: boolean;
    isArchived: boolean;
    createdAt: string;
    updatedAt: string;
    isAccessible?: boolean;
    projectPrivacy?: string;
    defaultSessionPrivacy?: string;
    isCreator?: boolean;
    createdBy?: string;
    projectHasUser?: ProjectHasUser[];
    // Typed with the project-integration slice when it moves over.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    integrations?: any[];
    resolutionEmailTemplate?: ResolutionEmailTemplate;
    owner?: ProjectStubOwner | null;
    accessRequest?: ProjectAccessRequest | null;
    /** People an access request emails, and how many of those aren't `owner`. */
    notifyCount?: number;
    notifyOtherCount?: number;
    /** Archived projects are purged at this time unless restored first. */
    projectWillBeDeleteAt?: string | null;
}

/** List response of GET /workspace/:id/project. */
export interface ProjectListResponse {
    list: ProjectObject[];
    total?: number;
    count?: number;
    hasMany?: boolean;
}

export interface GetAllProjectsObject extends AuthHeaderParams {
    queryParams?: QueryParams;
    workspace: string;
}

export interface InvitedUsers {
    id: string;
    role: string;
}

export interface ProjectPayload {
    name: string;
    projectPrivacy?: string;
    invitedUsers?: InvitedUsers[];
    defaultSessionPrivacy?: string;
    image?: string;
}

export interface CardDetails {
    type?: string;
    last4?: string;
    expiry_year?: number;
    expiry_month?: number;
    cardholder_name?: string;
}

export interface PaymentMethodDetails {
    card?: CardDetails;
    type?: string;
    paymentMethodId: string;
}

export interface UpdateProjectPayload extends Omit<ProjectPayload, 'name'> {
    name?: string;
    resolutionEmailTemplate?: ResolutionEmailTemplate;
}

export interface ProjectAccessRequestWithUser extends ProjectAccessRequest {
    requestToken: string;
    createdAt?: string;
    user: ShortUserInfoObject;
}
