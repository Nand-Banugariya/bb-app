'use client';
/* eslint-disable @typescript-eslint/no-explicit-any -- ported from bb-app as-is; typed when its feature moves over */
import { Dispatch, createSlice } from '@reduxjs/toolkit';
import { deepClone } from '@lib/helpers';
import { logger } from '@lib/logger';
import { PaginateSuccessResponse } from '@redux/models/common';
import { getAllSessionsAPIObject } from '@redux/models/session';
import { getAllSessionsAPI } from '@redux/services/sessions.api';
import { UserObject } from '../auth';
import { BugHasIntegration, BugHasTag, BugHasViewer } from '../sessionDetails';
import { CreationSource } from '@lib/types';

export interface SessionObject extends PaginateSuccessResponse {
    list: SessionListObject[];
    isLoading: boolean;
}

export interface SessionListObject {
    screenshot: Screenshot | null;
    screenRecording: ScreenRecording | null;
    bugStatus: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
    systemInfo: SystemInfo;
    pageInfo: any | null;
    id: string;
    workspaceId: string;
    projectId: string;
    userId: string;
    title: string;
    description: string | null;
    type: 'screenRecording' | 'screenshot';
    sessionType: 'tab' | 'visible';
    attachments: any[];
    priority: 'MEDIUM';
    evidence: string;
    bugPrivacy: 'PUBLIC' | 'PRIVATE';
    isDeleted: boolean;
    isArchived: boolean;
    createdAt: string;
    updatedAt: string;
    user: UserObject;
    isWorkspaceAdmin?: boolean;
    isLocked?: boolean;
    bugHasTag?: BugHasTag[];
    bugHasViewer?: BugHasViewer[];
    bugHasIntegration?: BugHasIntegration[];
    reporterEmail?: any;
    creationSource?: CreationSource;
    issueType?: string;
    customerResolutionEmailSentAt?: string | null;
    // Set when the session is in the trash; it is purged at this time unless
    // restored first.
    trashExpiresAt?: string | null;
}

export interface Screenshot {
    file: string;
    fullFile: string | null;
    isFullScreenShot: boolean;
    status: string | null;
    clickTimestamp: number | null;
    clickDateTime: string | null;
    startTimestamp: number | null;
    startDateTime: string | null;
    endTimestamp: number | null;
    endDateTime: string | null;
    timeout: number;
}

export interface TrimRange {
    start: string;
    end: string;
}

export interface Trim {
    keepRanges?: TrimRange[]; // segments to keep
    appliedAt?: string;
    minVal?: string;
    maxVal?: string;
    needsTrim?: boolean; // whether the selection actually trims anything
    actualDuration?: string; // full source duration (seconds)
    trimmedDuration?: string; // duration after virtual trim
}

export interface ScreenRecording {
    url: string;
    file: string;
    duration: string;
    size: string;
    status: string | null;
    clickTimestamp: number | null;
    clickDateTime: string | null;
    startTimestamp: number | null;
    startDateTime: string | null;
    endTimestamp: number | null;
    endDateTime: string | null;
    timeout: number;
    trim?: Trim;
}

export interface SystemInfo {
    url: string;
    userAgent: string;
    browser: BrowserInfo;
    engine: EngineInfo;
    os: OsInfo;
    device: DeviceInfo;
    windowOuterSize: WindowSize;
    windowInnerSize: WindowSize;
    scrollSize: WindowSize;
}

export interface BrowserInfo {
    name: string;
    version: string;
}

export interface EngineInfo {
    name: string;
    version: string;
}

export interface OsInfo {
    name: string;
    version: string;
}

export interface DeviceInfo {
    type: string;
    vendor: string;
    model: string;
}

export interface WindowSize {
    width: string;
    height: string;
}

export interface SessionSuccessResponse {
    data: SessionObject | any;
}

export interface SessionState {
    data: SessionObject | any;
    error: string | null;
    isLoading: boolean;
}

//==========initial state==============
const sessionInitialState: SessionState = {
    data: {},
    error: null,
    isLoading: false
};

export const sessionSlice = createSlice({
    name: 'sessions',
    initialState: deepClone(sessionInitialState),
    reducers: {
        sessionStarted: (state) => {
            return {
                ...state,
                isLoading: true
            };
        },
        sessionSuccess: (state, action) => {
            return {
                ...state,
                ...{
                    data: action.payload,
                    error: null,
                    isLoading: false
                }
            };
        },
        sessionUpdate: (state, action) => {
            if (
                action.payload.id &&
                state &&
                state.data &&
                state.data.list &&
                state.data.list.length > 0
            ) {
                const index = [...state.data.list].findIndex(
                    (l: SessionListObject) => l.id === action.payload.id
                );
                const updatedState = deepClone(state);
                if (index > -1) {
                    updatedState.data.list[index] = {
                        ...updatedState.data.list[index],
                        ...action.payload
                    };
                }
                return Object.assign({}, state, {
                    data: updatedState.data
                });
            }
        },
        sessionBulkUpdate: (state, action) => {
            if (
                action.payload.sessionIds &&
                Array.isArray(action.payload.sessionIds) &&
                state &&
                state.data &&
                state.data.list &&
                state.data.list.length > 0
            ) {
                const updatedState = deepClone(state);
                const updates = action.payload.updates || {};

                updatedState.data.list = updatedState.data.list.map(
                    (session: SessionListObject) => {
                        if (action.payload.sessionIds.includes(session.id)) {
                            return {
                                ...session,
                                ...updates
                            };
                        }
                        return session;
                    }
                );

                return Object.assign({}, state, {
                    data: updatedState.data
                });
            }
            return state;
        },
        sessionFail: (state, action) => {
            return {
                ...state,
                ...{ error: action.payload, isLoading: false }
            };
        },
        sessionReset: () => {
            return deepClone(sessionInitialState);
        }
    }
});

export const {
    sessionSuccess,
    sessionStarted,
    sessionUpdate,
    sessionBulkUpdate,
    sessionFail,
    sessionReset
} = sessionSlice.actions;

export const fetchSessions =
    ({ queryParams, projectId, workspaceId, signal }: getAllSessionsAPIObject) =>
    async (dispatch: Dispatch) => {
        dispatch(sessionStarted());
        try {
            const res: SessionObject = await getAllSessionsAPI({
                queryParams,
                projectId,
                workspaceId,
                signal
            });
            if (res) {
                dispatch(sessionSuccess(res));
            }
        } catch (error) {
            if (error instanceof Error) {
                // dispatch(sessionFail(error.message));
            } else {
                logger.error('fetchSessions error:', error);
            }
        }
    };
