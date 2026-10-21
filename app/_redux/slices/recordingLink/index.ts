'use client';
/* eslint-disable @typescript-eslint/no-explicit-any -- ported from bb-app as-is; typed when its feature moves over */
import { Dispatch, PayloadAction, createSlice } from '@reduxjs/toolkit';
import { deepClone } from '@lib/helpers';
import { logger } from '@lib/logger';
import { getRecordingLinksAPI } from '@redux/services/recordingLink.api';
import { PaginateSuccessResponse } from '@redux/models/common';

export interface RecordingLinkObject extends PaginateSuccessResponse {
    list: RecordingLink[];
    total: number;
    count: number;
    hasMany: boolean;
}

export interface RecordingLink {
    id: string;
    createdAt: string;
    bugId: string | null;
    uuid: string;
    url: string | null;
    thumbnail: string | null;
    thumbnails?: string[];
    name: string | null;
    expiresAt?: string | null;
    user: {
        id: string;
        name: string;
        image: string;
    };
    unchangedMetadata?: {
        intercomAdminName: string;
    };
    createdBy?: {
        id: string;
        name: string;
    };
    project?: {
        id: string;
        name: string;
    };
    status: 'NOT_USED' | 'IN_PROGRESS' | 'RECORDED' | 'COMPLETED' | 'DISABLED';
    recordingSeconds?: string | null;
    recordingSize?: string | null;
    recordingStackTrace?: any[] | null;
    videoKey?: string | null;
    videoChunkDate?: string | null;
    domain?: string | null;
    pageTitle?: string | null;
    isReusable?: boolean;
    usageLimit?: number | null;
    usageCount?: number | null;
}

export interface RecordingLinkSuccessResponse {
    data?: RecordingLinkObject | any;
}

export interface RecordingLinkState {
    data: RecordingLinkObject;
    isLoading?: boolean;
    error?: any;
}

//==========initial state==============
const recordingLinkInitialState: RecordingLinkState = {
    data: {
        list: [],
        total: 0,
        count: 0,
        hasMany: false
    },
    error: null,
    isLoading: false
};

export const recordingLinkSlice = createSlice({
    name: 'recordingLink',
    initialState: deepClone(recordingLinkInitialState),
    reducers: {
        recordingLinkStarted: (state) => {
            return {
                ...state,
                isLoading: true
            };
        },
        recordingLinkSuccess: (state, action) => {
            return {
                ...state,
                ...{
                    data: action.payload,
                    error: null,
                    isLoading: false
                }
            };
        },
        recordingLinkUpdate: (state, action: PayloadAction<RecordingLink>) => {
            if (
                action.payload.id &&
                state &&
                state.data &&
                state.data.list &&
                state.data.list.length > 0
            ) {
                const index = [...state.data.list].findIndex(
                    (l: RecordingLink) => l.id === action.payload.id
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
        recordingLinkFail: (state, action) => {
            return {
                ...state,
                ...{ error: action.payload, isLoading: false }
            };
        },
        recordingLinkReset: () => {
            return deepClone(recordingLinkInitialState);
        }
    }
});

export const {
    recordingLinkStarted,
    recordingLinkSuccess,
    recordingLinkFail,
    recordingLinkReset,
    recordingLinkUpdate
} = recordingLinkSlice.actions;

export const fetchRecordingLinks =
    ({ workspaceId, queryParams }: any) =>
    async (dispatch: Dispatch) => {
        dispatch(recordingLinkStarted());
        try {
            const res: RecordingLinkObject = await getRecordingLinksAPI({
                workspaceId: workspaceId || '',
                queryParams
            });
            if (res) {
                dispatch(recordingLinkSuccess(res));
            }
        } catch (error) {
            if (error instanceof Error) {
                dispatch(recordingLinkFail(error.message));
            } else {
                logger.error('fetchRecordingLinks error : ', error);
            }
        }
    };
