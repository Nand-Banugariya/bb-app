'use client';
/* eslint-disable @typescript-eslint/no-explicit-any -- ported from bb-app as-is; typed when its feature moves over */
import { Dispatch, createSlice } from '@reduxjs/toolkit';
import { UserObject } from '../auth';
import { PaginateSuccessResponse } from '@redux/models/common';
import { deepClone } from '@lib/helpers';
import { GetBugCommentsAPIObject } from '@redux/models/bugComment';
import { getBugCommentsAPI, getGuestUserBugCommentsAPI } from '@redux/services/bugComment.api';
import { logger } from '@lib/logger';

export interface SubUserObject {
    userId?: string;
    name: string;
    email: string;
    image: string;
}

export interface CommentReactionObject {
    emoji: string;
    react: string;
    userCount: number;
    users: SubUserObject[];
}

export interface BugCommentListObject {
    attachments: Array<string>;
    bugId: string;
    comment: string;
    createdAt: string;
    guestUserName: string | null;
    id: string;
    isDeleted: boolean;
    updatedAt: string;
    user?: UserObject;
    commentReaction: { [key: string]: CommentReactionObject };
    userId: string | null;
}

export interface BugCommentObject extends PaginateSuccessResponse {
    list: BugCommentListObject[];
}

export interface BugCommentSuccessResponse {
    data: BugCommentObject | any;
}

export interface BugCommentPayload {
    comment: string;
    attachments?: ['string'];
    timestamp?: string;
    // Set when an agent posts a `/resolved` response on a WEB_SDK bug — tells the
    // backend to email the external reporter that their issue has been resolved.
    notifyCustomerResolved?: boolean;
}

export interface BugCommentReactPayload {
    react: string;
}

export interface BugCommentState {
    data?: BugCommentObject | any;
    error?: string | null;
    isLoading?: boolean;
}

const bugCommentInitialState: BugCommentState = {
    data: {},
    error: null,
    isLoading: false
};

export const bugCommentSlice = createSlice({
    name: 'bugComment',
    initialState: deepClone(bugCommentInitialState),
    reducers: {
        bugCommentStarted: (state) => {
            return {
                ...state,
                isLoading: true
            };
        },
        bugCommentSuccess: (state, action) => {
            return {
                ...state,
                ...{
                    data: action.payload,
                    error: null,
                    isLoading: false
                }
            };
        },
        bugCommentUpdate: (state, action) => {
            const updatedState = deepClone(state);
            let index = 0;
            if (
                action.payload.id &&
                state &&
                state.data &&
                state.data.list &&
                state.data.list.length > 0
            ) {
                index = [...state.data.list].findIndex(
                    (l: BugCommentListObject) => l.id === action.payload.id
                );

                if (index > -1) {
                    updatedState.data.list[index] = {
                        ...updatedState.data.list[index],
                        ...action.payload
                    };
                    updatedState.data.count = updatedState.data.count + 1;
                    updatedState.data.total = updatedState.data.total + 1;
                } else {
                    updatedState.data?.list?.push(action.payload);
                }
            } else {
                updatedState.data?.list?.push(action.payload);
            }
            return Object.assign({}, state, {
                data: updatedState.data
            });
        },
        bugCommentFail: (state, action) => {
            return {
                ...state,
                ...{ error: action.payload, isLoading: false }
            };
        },
        bugCommentReset: () => {
            return deepClone(bugCommentInitialState);
        }
    }
});

export const {
    bugCommentStarted,
    bugCommentSuccess,
    bugCommentUpdate,
    bugCommentFail,
    bugCommentReset
} = bugCommentSlice.actions;

export const fetchBugComments =
    ({ workspaceId, projectId, bugId, queryParams }: GetBugCommentsAPIObject) =>
    async (dispatch: Dispatch) => {
        dispatch(bugCommentStarted());
        try {
            const bugComments: BugCommentSuccessResponse = await getBugCommentsAPI({
                workspaceId,
                projectId,
                bugId,
                queryParams
            });
            if (bugComments) {
                dispatch(bugCommentSuccess(bugComments));
            }
        } catch (error) {
            if (error instanceof Error) {
                dispatch(bugCommentFail(error.message));
            } else {
                logger.error('fetchBugComments error : ', error);
            }
        }
    };

export const fetchGuestUserBugComments =
    ({ workspaceId, projectId, bugId, queryParams }: GetBugCommentsAPIObject) =>
    async (dispatch: Dispatch) => {
        dispatch(bugCommentStarted());
        try {
            const bugComments: BugCommentSuccessResponse = await getGuestUserBugCommentsAPI({
                workspaceId,
                projectId,
                bugId,
                queryParams
            });

            if (bugComments) {
                dispatch(bugCommentSuccess(bugComments));
            }
        } catch (error) {
            if (error instanceof Error) {
                dispatch(bugCommentFail(error.message));
            } else {
                logger.error('fetchGuestUserBugComments error : ', error);
            }
        }
    };
