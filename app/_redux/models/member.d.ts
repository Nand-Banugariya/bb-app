import type { UserObject } from '../slices/auth';
import type { ProjectObject } from './project';

/** A user's membership row in a workspace (GET /workspace/:id/member and /user). */
export interface WorkspaceHasUser {
    id: string;
    workspaceId: string;
    userId: string;
    isOwner: boolean;
    role: string;
    /** ENABLED, INVITED, REQUESTED, DISABLED … */
    status: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    user: UserObject;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    invitationData?: any | null;
    /** Per-member monthly AI consumption (credits are metered per member). */
    currentMonthlyConsumedAiCredits?: number;
    currentMonthlyConsumedAiTokens?: number;
    totalConsumedIntegrationCredits?: number;
}

/** Fields of the sidebar preference; send only the ones being changed. */
export interface UserPreferencePayload {
    indexes?: string[];
    favouriteProjectIds?: string[];
}

/** Response of the member add / remove / re-invite endpoints. */
export interface MemberObject {
    id: string;
    name: string;
    logo: string;
    status: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    workspaceHasUser: WorkspaceHasUser[];
    project: ProjectObject[];
    baseUrl: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    errors: any;
}
