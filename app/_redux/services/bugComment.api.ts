import { fetch } from '@lib/axiosConfig';
import { GetBugCommentsAPIObject } from '../models/bugComment';

import {
    BugCommentPayload,
    BugCommentReactPayload,
    BugCommentSuccessResponse
} from '../slices/bugComment';

export const createBugCommentAPI = async ({
    payload,
    workspaceId,
    projectId,
    bugId
}: {
    payload: BugCommentPayload;
    workspaceId: string | string[];
    projectId: string | string[];
    bugId: string | string[];
}): Promise<BugCommentSuccessResponse> => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/bug/${bugId}/comment`,
        method: 'POST',
        data: payload
    });
};

export const createGuestUserBugCommentAPI = async ({
    payload,
    workspaceId,
    projectId,
    bugId
}: {
    payload: BugCommentPayload;
    workspaceId: string | string[];
    projectId: string | string[];
    bugId: string | string[];
}): Promise<BugCommentSuccessResponse> => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/bug/${bugId}/comment/guest`,
        method: 'POST',
        data: payload
    });
};

export const getBugCommentsAPI = async ({
    workspaceId,
    projectId,
    bugId,
    queryParams
}: GetBugCommentsAPIObject): Promise<BugCommentSuccessResponse> => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/bug/${bugId}/comment`,
        method: 'GET',
        params: queryParams
            ? queryParams
            : {
                  orderBy: 'createdAt|desc',
                  take: 20,
                  include: ['user', 'bugHasCommentHasReaction']
              }
    });
};

export const getGuestUserBugCommentsAPI = async ({
    workspaceId,
    projectId,
    bugId,
    queryParams
}: GetBugCommentsAPIObject): Promise<BugCommentSuccessResponse> => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/bug/${bugId}/comment/guest`,
        method: 'GET',
        params: queryParams
            ? queryParams
            : {
                  orderBy: 'createdAt|desc',
                  take: 20,
                  include: ['user', 'bugHasCommentHasReaction']
              }
    });
};

export const toggleCommentReactionsAPI = async ({
    payload,
    workspaceId,
    projectId,
    bugId,
    bugCommentId
}: {
    payload: BugCommentReactPayload;
    workspaceId: string | string[];
    projectId: string | string[];
    bugId: string | string[];
    bugCommentId: string | string[];
}): Promise<BugCommentSuccessResponse> => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/bug/${bugId}/comment/${bugCommentId}/react`,
        method: 'POST',
        data: payload
    });
};

export const editBugCommentReactionsAPI = async ({
    payload,
    workspaceId,
    projectId,
    bugId,
    bugCommentId
}: {
    payload: BugCommentPayload;
    workspaceId: string | string[];
    projectId: string | string[];
    bugId: string | string[];
    bugCommentId: string | string[];
}): Promise<BugCommentSuccessResponse> => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/bug/${bugId}/comment/${bugCommentId}`,
        method: 'PATCH',
        data: payload
    });
};

export const deleteBugCommentReactionsAPI = async ({
    workspaceId,
    projectId,
    bugId,
    bugCommentId
}: {
    workspaceId: string | string[];
    projectId: string | string[];
    bugId: string | string[];
    bugCommentId: string | string[];
}): Promise<BugCommentSuccessResponse> => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/bug/${bugId}/comment/${bugCommentId}`,
        method: 'DELETE'
    });
};
