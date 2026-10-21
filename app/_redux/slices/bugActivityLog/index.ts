'use client';
/* eslint-disable @typescript-eslint/no-explicit-any -- ported from bb-app as-is; typed when its feature moves over */
import { Dispatch, createSlice } from '@reduxjs/toolkit';
import { UserObject } from '../auth';
import { PaginateSuccessResponse } from '@redux/models/common';
import { deepClone } from '@lib/helpers';
import { GetBugActivityLogsAPIObject } from '@redux/models/bugActivityLog';

import { logger } from '@lib/logger';
import { getSessionActivityLogsAPI } from '@redux/services/sessions.api';

export interface SubUserObject {
    userId?: string;
    name: string;
    email: string;
}

export interface ActivityLogReactionObject {
    emoji: string;
    react: string;
    userCount: number;
    users: SubUserObject[];
}

export interface BugActivityLogListObject {
    attachments: Array<string>;
    bugId: string;
    activitylog: string;
    createdAt: string;
    guestUserName: string | null;
    id: string;
    isDeleted: boolean;
    updatedAt: string;
    user?: UserObject;
    activitylogReaction: { [key: string]: ActivityLogReactionObject };
    userId: string | null;
}

export interface BugActivityLogObject extends PaginateSuccessResponse {
    list: BugActivityLogListObject[];
}

export interface BugActivityLogSuccessResponse {
    data: BugActivityLogObject | any;
}

export interface BugActivityLogPayload {
    activitylog: string;
    attachments?: ['string'];
}

export interface BugActivityLogReactPayload {
    react: string;
}

export interface BugActivityLogState {
    data?: BugActivityLogObject | any;
    error?: string | null;
    isLoading?: boolean;
}

export interface BugActivityLogsState {
    data?: BugActivityLogObject | any;
    error?: string | null;
    isLoading?: boolean;
}

const bugActivityLogInitialState: BugActivityLogState = {
    data: {},
    error: null,
    isLoading: false
};

export const bugActivityLogSlice = createSlice({
    name: 'bugActivityLog',
    initialState: deepClone(bugActivityLogInitialState),
    reducers: {
        bugActivityLogStarted: (state) => {
            return {
                ...state,
                isLoading: true
            };
        },
        bugActivityLogSuccess: (state, action) => {
            return {
                ...state,
                ...{
                    data: action.payload,
                    error: null,
                    isLoading: false
                }
            };
        },
        bugActivityLogUpdate: (state, action) => {
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
                    (l: BugActivityLogListObject) => l.id === action.payload.id
                );

                if (index > -1) {
                    if (updatedState.data?.list) {
                        updatedState.data.list[index] = {
                            ...updatedState.data.list[index],
                            ...action.payload
                        };
                    }
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
        bugActivityLogFail: (state, action) => {
            return {
                ...state,
                ...{ error: action.payload, isLoading: false }
            };
        },
        bugActivityLogReset: () => {
            return deepClone(bugActivityLogInitialState);
        }
    }
});

export const {
    bugActivityLogStarted,
    bugActivityLogSuccess,
    bugActivityLogUpdate,
    bugActivityLogFail,
    bugActivityLogReset
} = bugActivityLogSlice.actions;

export const fetchBugActivityLogs =
    ({ workspaceId, projectId, bugId, queryParams }: GetBugActivityLogsAPIObject) =>
    async (dispatch: Dispatch) => {
        dispatch(bugActivityLogStarted());
        try {
            const bugActivityLogs: BugActivityLogSuccessResponse = queryParams
                ? await getSessionActivityLogsAPI({
                      workspaceId,
                      projectId,
                      bugId,
                      queryParams
                  })
                : await getSessionActivityLogsAPI({
                      workspaceId,
                      projectId,
                      bugId
                  });
            if (bugActivityLogs) {
                dispatch(bugActivityLogSuccess(bugActivityLogs));
            }
        } catch (error) {
            if (error instanceof Error) {
                dispatch(bugActivityLogFail(error.message));
            } else {
                logger.error('fetchBugActivityLogs error : ', error);
            }
        }
    };
