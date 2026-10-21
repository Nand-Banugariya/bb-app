/* eslint-disable @typescript-eslint/no-explicit-any -- ported from bb-app as-is; typed when its feature moves over */
import { fetch } from '@lib/axiosConfig';

export const createRecordingLinkAPI = async ({
    workspaceId,
    projectId,
    name,
    url,
    isReusable,
    expiresAt,
    usageLimit
}: {
    workspaceId: string;
    projectId: string;
    name?: string;
    url?: string;
    isReusable?: boolean;
    expiresAt?: string;
    usageLimit?: number;
}): Promise<any> => {
    return fetch({
        url: `/workspace/${workspaceId}/recording-link`,
        method: 'POST',
        data: { projectId, name, url, isReusable, expiresAt, usageLimit }
    });
};

export const updateRecordingLinkAPI = async ({
    workspaceId,
    recordingLinkId,
    name,
    url,
    isReusable,
    expiresAt,
    usageLimit,
    projectId
}: {
    workspaceId: string;
    recordingLinkId: string;
    name?: string;
    url?: string;
    isReusable?: boolean;
    expiresAt?: string;
    usageLimit?: number;
    projectId?: string;
}): Promise<any> => {
    return fetch({
        url: `/workspace/${workspaceId}/recording-link/${recordingLinkId}`,
        method: 'PATCH',
        data: { name, url, isReusable, expiresAt, usageLimit, projectId }
    });
};

export const getRecordingLinksAPI = async ({
    workspaceId,
    queryParams,
    signal
}: {
    workspaceId: string;
    queryParams?: Record<string, any>;
    signal?: AbortSignal;
}): Promise<any> => {
    return fetch({
        url: `/workspace/${workspaceId}/recording-link`,
        method: 'GET',
        params: queryParams,
        signal
    });
};

export const getRecordingLinkByIdAPI = async ({
    workspaceId,
    recordingLinkId
}: {
    workspaceId: string;
    recordingLinkId: string;
}): Promise<any> => {
    return fetch({
        url: `/workspace/${workspaceId}/recording-link/${recordingLinkId}`,
        method: 'GET'
    });
};

export const verifyRecordingDomainAPI = async ({
    workspaceId,
    url
}: {
    workspaceId: string;
    url: string;
}): Promise<any> => {
    return fetch({
        url: `/workspace/${workspaceId}/verified-domain`,
        method: 'POST',
        data: { url }
    });
};

export const getReusableLinkSessionsAPI = async ({
    workspaceId,
    recordingLinkId,
    queryParams
}: {
    workspaceId: string;
    recordingLinkId: string;
    queryParams?: Record<string, any>;
}): Promise<any> => {
    return fetch({
        url: `/workspace/${workspaceId}/recording-link/bugs/${recordingLinkId}`,
        method: 'GET',
        params: queryParams
    });
};

export const removeVerifiedDomainAPI = async ({
    workspaceId,
    verifiedDomainId
}: {
    workspaceId: string;
    verifiedDomainId: string;
}): Promise<any> => {
    return fetch({
        url: `/workspace/${workspaceId}/verified-domain/${verifiedDomainId}`,
        method: 'DELETE'
    });
};

export const getVerifiedDomainsAPI = async ({
    workspaceId
}: {
    workspaceId: string;
}): Promise<any> => {
    return fetch({
        url: `/workspace/${workspaceId}/verified-domain`,
        method: 'GET'
    });
};

export const deleteRecordingLinkAPI = async ({
    workspaceId,
    recordingLinkId
}: {
    workspaceId: any;
    recordingLinkId: string;
}): Promise<any> => {
    return fetch({
        url: `/workspace/${workspaceId}/recording-link/${recordingLinkId}`,
        method: 'DELETE'
    });
};

export const bulkDeleteRecordingLinksAPI = async ({
    workspaceId,
    recordingLinkIds,
    isAll,
    excludeRecordingLinkIds,
    status,
    filters
}: {
    workspaceId: any;
    recordingLinkIds: string[];
    isAll?: boolean;
    // When isAll is true, these links are excluded from the delete (the
    // "Select All except a few" case).
    excludeRecordingLinkIds?: string[];
    // The status tab the selection was made on. Only used by bb-api when
    // `filters` is missing.
    status?: 'all' | 'pending' | 'used';
    // With isAll: the list's query (tab, search, filters), so the delete
    // covers exactly the links the list shows. Needs bb-api with
    // bulk-delete `filters` support: an older one drops the field and would
    // delete the whole tab.
    filters?: Record<string, unknown>;
}): Promise<any> => {
    return fetch({
        url: `/workspace/${workspaceId}/recording-link/bulk-delete`,
        method: 'DELETE',
        data: {
            ...(isAll && { isAll }),
            ...(recordingLinkIds && { recordingLinkIds }),
            ...(excludeRecordingLinkIds &&
                excludeRecordingLinkIds.length > 0 && { excludeRecordingLinkIds }),
            ...(status && { status }),
            ...(filters && { filters })
        }
    });
};
