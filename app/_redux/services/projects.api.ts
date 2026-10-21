import { fetch } from '@lib/axiosConfig';
import type {
    GetAllProjectsObject,
    ProjectAccessRequest,
    ProjectListResponse,
    ProjectObject,
    ProjectAccessRequestWithUser,
    ProjectPayload,
    UpdateProjectPayload
} from '../models/project';

// The endpoints the app shell (sidebar, create-project dialog) needs are ported. Project
// settings, members, API keys and invite links move over with their pages.

export const createProjectAPI = async ({
    workspaceId,
    payload
}: {
    workspaceId: string;
    payload: ProjectPayload;
}): Promise<ProjectObject> => {
    const { invitedUsers, ...rest } = payload;
    return fetch({
        url: `/workspace/${workspaceId}/project`,
        method: 'POST',
        // bb-api rejects an empty invitedUsers array.
        data: invitedUsers?.length ? { ...rest, invitedUsers } : rest
    });
};

export const getAllProjectsAPI = async ({
    queryParams,
    authorization,
    workspace
}: GetAllProjectsObject): Promise<ProjectListResponse> => {
    return fetch({
        url: `/workspace/${workspace}/project`,
        method: 'GET',
        params: queryParams,
        headers: { authorization }
    });
};

export const getProjectByIdAPI = async ({
    workspaceId,
    projectId
}: {
    workspaceId: string;
    projectId: string;
}): Promise<ProjectObject> => {
    return fetch({ url: `/workspace/${workspaceId}/project/${projectId}`, method: 'GET' });
};

/** Marks a project's bugs as seen for the current user, clearing its sidebar badge. */
export const markProjectBugsSeenAPI = async ({
    workspaceId,
    projectId
}: {
    workspaceId: string;
    projectId: string;
}): Promise<{ success: boolean }> => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/bugs-seen`,
        method: 'POST'
    });
};

/** Asks to join a private project (the sidebar's locked rows). */
export const requestProjectAccessAPI = async ({
    workspaceId,
    projectId
}: {
    workspaceId: string;
    projectId: string;
}): Promise<ProjectAccessRequest> => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/access-request`,
        method: 'POST'
    });
};

/* Ported from bb-app as-is ------------------------------------------------------------------- */

export const generateProjectAPIKeyAPI = async ({
    workspaceId,
    projectId
}: {
    workspaceId: string;
    projectId: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/api-key`,
        method: 'POST'
    });
};

export const regenerateProjectAPIKeyAPI = async ({
    workspaceId,
    projectId
}: {
    workspaceId: string;
    projectId: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/api-key/re-generate`,
        method: 'PUT'
    });
};

export const expireProjectAPIKeyAPI = async ({
    workspaceId,
    projectId,
    apiKeyId
}: {
    workspaceId: string;
    projectId: string;
    apiKeyId: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/api-key/${apiKeyId}/expire-now`,
        method: 'PUT'
    });
};

export const deleteProjectAPIKeyAPI = async ({
    workspaceId,
    projectId,
    apiKeyId
}: {
    workspaceId: string;
    projectId: string;
    apiKeyId: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/api-key/${apiKeyId}`,
        method: 'DELETE'
    });
};

export const getProjectAPIKeyByProjectId = async ({
    workspaceId,
    projectId
}: {
    workspaceId: string;
    projectId: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/api-key`,
        method: 'GET'
    });
};

// ---------------------------------------------------------------------------
// Workspace-wide API keys. The key belongs to the workspace (and the user who
// created it); the project is supplied per-request via the SDK (x-project-id).
// One active key per user per workspace.
// ---------------------------------------------------------------------------

export const generateWorkspaceAPIKeyAPI = async ({ workspaceId }: { workspaceId: string }) => {
    return fetch({
        url: `/workspace/${workspaceId}/api-key`,
        method: 'POST'
    });
};

export const getWorkspaceAPIKeysAPI = async ({ workspaceId }: { workspaceId: string }) => {
    return fetch({
        url: `/workspace/${workspaceId}/api-key`,
        method: 'GET'
    });
};

export const expireWorkspaceAPIKeyAPI = async ({
    workspaceId,
    apiKeyId
}: {
    workspaceId: string;
    apiKeyId: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}/api-key/${apiKeyId}/expire-now`,
        method: 'PUT'
    });
};

export const deleteWorkspaceAPIKeyAPI = async ({
    workspaceId,
    apiKeyId
}: {
    workspaceId: string;
    apiKeyId: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}/api-key/${apiKeyId}`,
        method: 'DELETE'
    });
};

export const getProjectByWorkspaceId = async (): Promise<ProjectObject> => {
    return fetch({
        url: `/project`,
        method: 'GET'
    });
};

export const updateProjectByID = async ({
    payload,
    projectId,
    workspaceId
}: {
    payload: UpdateProjectPayload;
    projectId: string;
    workspaceId: string;
}): Promise<ProjectObject> => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}`,
        method: 'PATCH',
        data: payload
    });
};

export const sendResolutionEmailPreviewAPI = async ({
    payload,
    projectId,
    workspaceId
}: {
    payload: { subject: string; body: string };
    projectId: string;
    workspaceId: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/resolution-email/preview`,
        method: 'POST',
        data: payload
    });
};

export const updateSessionPrivacyByProjectId = async ({
    payload,
    projectId,
    workspaceId
}: {
    payload: UpdateProjectPayload;
    projectId: string;
    workspaceId: string;
}): Promise<ProjectObject> => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/session-privacy`,
        method: 'PATCH',
        data: payload
    });
};

export const inviteMemberByProjectIdAPI = async ({
    workspaceId,
    projectId,
    payload
}: {
    workspaceId: string;
    projectId: string;
    payload: { userId: string };
}): Promise<ProjectObject> => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/member`,
        method: 'POST',
        data: payload
    });
};

// Invite a person to a project by email — they need NOT already be a workspace
// member. Outsiders receive the standard workspace invite mail; on accept, a
// private project grants membership automatically. Backend:
// POST /workspace/:workspaceId/project/:projectId/member/invite
export const inviteMemberByEmailProjectIdAPI = async ({
    workspaceId,
    projectId,
    payload
}: {
    workspaceId: string;
    projectId: string;
    payload: { email: string; role?: string };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<any> => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/member/invite`,
        method: 'POST',
        data: payload
    });
};

export const removeMemberByProjectIdAPI = async ({
    workspaceId,
    projectId,
    userId
}: {
    workspaceId: string;
    projectId: string;
    userId: string;
}): Promise<ProjectObject> => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/member/${userId}`,
        method: 'DELETE'
    });
};

export const updateMemberByProjectIdAPI = async ({
    workspaceId,
    projectId,
    userId,
    payload
}: {
    workspaceId: string;
    projectId: string;
    userId: string;
    payload: { role: string };
}): Promise<ProjectObject> => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/member/${userId}`,
        method: 'PATCH',
        data: payload
    });
};

// Archives the project (same as archiveSpaceAPI); its sessions go to the
// trash for 30 days. Idempotent: an already-archived project comes back
// unchanged. Permanent deletion is DELETE .../project/:projectId/permanent.
export const deleteProjectAPI = async ({
    workspaceId,
    projectId
}: {
    workspaceId: string;
    projectId: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}`,
        method: 'DELETE'
    });
};

export const archiveSpaceAPI = async ({
    workspaceId,
    projectId
}: {
    workspaceId: string;
    projectId: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/archive`,
        method: 'DELETE'
    });
};

// No callers: restoring a session of a deleted project (bug/restore) now
// restores the project too, in the same call. Kept for a future
// "Restore project" action.
export const restoreArchivedSpaceAPI = async ({
    workspaceId,
    projectId
}: {
    workspaceId: string;
    projectId: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/restore`,
        method: 'POST'
    });
};

export const updateProjectMembersAPI = async ({
    workspaceId,
    projectId,
    payload
}: {
    workspaceId: string;
    projectId: string;
    payload: {
        invitedUsers: {
            id: string;
            role: 'ADMIN' | 'MEMBER';
        }[];
    };
}): Promise<ProjectObject> => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/members`,
        method: 'POST',
        data: payload
    });
};

// Pending access requests for a project — project admins only.
export const getProjectAccessRequestsAPI = async ({
    workspaceId,
    projectId
}: {
    workspaceId: string;
    projectId: string;
}): Promise<ProjectAccessRequestWithUser[]> => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/access-request`,
        method: 'GET'
    });
};

export const respondProjectAccessRequestAPI = async ({
    workspaceId,
    projectId,
    payload
}: {
    workspaceId: string;
    projectId: string;
    payload: {
        requestToken: string;
        action: 'approved' | 'rejected';
        role?: 'ADMIN' | 'MEMBER' | 'GUEST';
    };
}): Promise<{ id: string; status: string; role?: string }> => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/access-request/respond`,
        method: 'POST',
        data: payload
    });
};

export const leaveProjectAPI = async ({
    workspaceId,
    projectId
}: {
    workspaceId: string;
    projectId: string;
}): Promise<ProjectObject> => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/leave`,
        method: 'DELETE'
    });
};

export const getProjectsWithIntegrationAPI = async ({
    workspaceId,
    tool
}: {
    workspaceId: string;
    tool: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<any[]> => {
    return fetch({
        url: `/workspace/${workspaceId}/integration/${tool}/projects`,
        method: 'GET'
    });
};

// ── Project invite link ─────────────────────────────────────────────────────
// Private projects only — a public project is already open to the whole
// workspace, so the API rejects these for one. Shape matches the workspace
// invite link; see WorkspaceInviteLink in workspace.api.ts.

export type ProjectInviteLink = {
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

export const getProjectInviteLinkAPI = async ({
    workspaceId,
    projectId
}: {
    workspaceId: string;
    projectId: string;
}): Promise<ProjectInviteLink> => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/invite-link`,
        method: 'GET'
    });
};

export const updateProjectInviteLinkAPI = async ({
    workspaceId,
    projectId,
    isEnabled,
    expiresInDays
}: {
    workspaceId: string;
    projectId: string;
    isEnabled?: boolean;
    expiresInDays?: number | null;
}): Promise<ProjectInviteLink> => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/invite-link`,
        method: 'PATCH',
        data: {
            ...(isEnabled !== undefined && { isEnabled }),
            ...(expiresInDays !== undefined && { expiresInDays })
        }
    });
};

export const resetProjectInviteLinkAPI = async ({
    workspaceId,
    projectId
}: {
    workspaceId: string;
    projectId: string;
}): Promise<ProjectInviteLink> => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/invite-link/reset`,
        method: 'POST'
    });
};
