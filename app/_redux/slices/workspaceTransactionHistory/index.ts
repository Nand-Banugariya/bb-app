'use client';
/* eslint-disable @typescript-eslint/no-explicit-any -- ported from bb-app as-is; typed when its feature moves over */
import { Dispatch, createSlice } from '@reduxjs/toolkit';
import { deepClone } from '@lib/helpers';
import { logger } from '@lib/logger';
import { getWorkspaceTransactionHistoryAPI } from '@redux/services/workspace.api';
// Paddle's transaction preview; typed when billing moves over.
type TransactionPreviewResponse = Record<string, any>;

export interface WorkspaceTransactionHistorySuccessResponse {
    data: TransactionPreviewResponse[] | any;
}

export interface WorkspaceTransactionHistoryState {
    data?: TransactionPreviewResponse | any;
    error?: string | null;
    isLoading?: boolean;
}

export interface WorkspaceTransactionHistoryDataPayload {
    workspaceId: string;
}

//==========initial state==============
const workspaceTransactionHistoryInitialState: WorkspaceTransactionHistoryState = {
    data: {},
    error: null,
    isLoading: false
};

export const workspaceTransactionHistorySlice = createSlice({
    name: 'workspaceTransactionHistory',
    initialState: deepClone(workspaceTransactionHistoryInitialState),
    reducers: {
        workspaceTransactionHistoryStarted: (state) => {
            return {
                ...state,
                isLoading: true
            };
        },
        workspaceTransactionHistorySuccess: (state, action) => {
            return {
                ...state,
                ...{
                    data: action.payload,
                    error: null,
                    isLoading: false
                }
            };
        },
        workspaceTransactionHistoryFail: (state, action) => {
            return {
                ...state,
                ...{ error: action.payload, isLoading: false }
            };
        },
        workspaceTransactionHistoryReset: () => {
            return deepClone(workspaceTransactionHistoryInitialState);
        }
    }
});

export const {
    workspaceTransactionHistoryStarted,
    workspaceTransactionHistorySuccess,
    workspaceTransactionHistoryFail,
    workspaceTransactionHistoryReset
} = workspaceTransactionHistorySlice.actions;

export const fetchWorkspaceTransactionHistory =
    (workspaceId: string) => async (dispatch: Dispatch<any>) => {
        dispatch(workspaceTransactionHistoryStarted());
        try {
            const workspaceTransactionHistoryResponse: WorkspaceTransactionHistorySuccessResponse =
                await getWorkspaceTransactionHistoryAPI({ workspaceId });
            if (workspaceTransactionHistoryResponse) {
                dispatch(workspaceTransactionHistorySuccess(workspaceTransactionHistoryResponse));
            }
        } catch (error) {
            if (error instanceof Error) {
                dispatch(workspaceTransactionHistoryFail(error.message));
            } else {
                logger.error('fetchWorkspaceTransactionHistory error : ', error);
            }
        }
    };
