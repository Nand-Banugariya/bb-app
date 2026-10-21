import { fetch } from '@lib/axiosConfig';
import type { MemberObject, UserPreferencePayload } from '../models/member';

// Only the sidebar preference has been ported from bb-app so far. Inviting, removing and
// re-inviting members move over with the members settings page.

/** Saves the sidebar's project order / favourites. The API keeps fields that aren't sent. */
export const updateUserPreferenceAPI = async ({
    workspaceId,
    preference
}: {
    workspaceId: string;
    preference: UserPreferencePayload;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<any> => {
    return fetch({
        url: `/workspace/${workspaceId}/user-preference`,
        method: 'POST',
        data: preference
    });
};

/* Ported from bb-app as-is ------------------------------------------------------------------- */

export const removeUserFromWorkspace = async ({
    workspaceId,
    userId
}: {
    workspaceId: string | string[];
    userId: string;
}): Promise<MemberObject> => {
    return fetch({
        url: `/workspace/${workspaceId}/user/${userId}`,
        method: 'DELETE'
    });
};

export type MemberRemovalImpact = {
    projects: {
        id: string;
        name: string;
        image?: string;
        isArchived?: boolean;
        newOwner: {
            id: string;
            name: string;
            email: string;
            image?: string;
            reason: 'PROJECT_ADMIN' | 'WORKSPACE_OWNER' | 'WORKSPACE_ADMIN' | null;
        } | null;
    }[];
};

// Which projects change owner if this member is removed. Backed by the same
// resolver the removal itself uses, so the dialog can't promise a successor the
// removal wouldn't pick.
export const getMemberRemovalImpact = async ({
    workspaceId,
    userId
}: {
    workspaceId: string | string[];
    userId: string;
}): Promise<MemberRemovalImpact> => {
    return fetch({
        url: `/workspace/${workspaceId}/user/${userId}/removal-impact`,
        method: 'GET'
    });
};

export const addMemberToWorkSpace = async ({
    workspaceId,
    email,
    role,
    users
}: {
    workspaceId: string | string[];
    email?: string;
    role?: string;
    users?: {
        email: string;
        role: string;
    }[];
}): Promise<MemberObject> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data: any;
    if (email && role) data = { email: email, role: role };
    else if (users) data = { users };
    return fetch({
        url: `/workspace/${workspaceId}/user`,
        method: 'POST',
        data: data
    });
};

export const resendWorkspaceUserInvitationAPI = async ({
    workspaceId,
    userId
}: {
    workspaceId: string;
    userId: string;
}): Promise<MemberObject> => {
    return fetch({
        url: `/workspace/${workspaceId}/user/${userId}/resend-invitation`,
        method: 'PATCH'
    });
};

export const updateToolsPreference = async ({
    workspaceId,
    toolsPreferance
}: {
    workspaceId: string;
    toolsPreferance: {
        [key: string]: boolean;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<any> => {
    return fetch({
        url: `/workspace/${workspaceId}/user-preference`,
        method: 'POST',
        data: {
            toolsPreferance
        }
    });
};
