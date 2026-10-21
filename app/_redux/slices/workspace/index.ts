'use client';
import { Dispatch, PayloadAction, createSlice } from '@reduxjs/toolkit';
import { getAllWorkspaceAPI } from '@redux/services/workspace.api';
import { deepClone } from '@lib/helpers';
import { logger } from '@lib/logger';
import type {
    GetAllWorkspaceObject,
    WorkspaceListResponse,
    WorkspaceObject
} from '../../models/workspace';

// The shell reads the user's workspaces from loginUser (who-am-i), as in bb-app. This slice
// holds the GET /workspace list for screens that need it fresh, e.g. the workspace switcher
// after creating a workspace.

export interface WorkspaceState {
    data: WorkspaceListResponse;
    isLoading?: boolean;
    error?: string | null;
}

//==========initial state==============
const workspaceInitialState: WorkspaceState = {
    data: { list: [] },
    error: null,
    isLoading: false
};

export const workSpaceSlice = createSlice({
    name: 'workspace',
    initialState: deepClone(workspaceInitialState),
    reducers: {
        workspaceStarted: (state) => {
            return { ...state, isLoading: true };
        },
        workspaceSuccess: (state, action: PayloadAction<WorkspaceListResponse>) => {
            return { ...state, data: action.payload, error: null, isLoading: false };
        },
        /** Merges a changed workspace into the list (no-op when it isn't there). */
        workspaceUpdate: (state, action: PayloadAction<Partial<WorkspaceObject>>) => {
            const { id } = action.payload;
            if (!id || !state.data.list?.some((w) => w.id === id)) return state;
            return {
                ...state,
                data: {
                    ...state.data,
                    list: state.data.list.map((w) =>
                        w.id === id ? { ...w, ...action.payload } : w
                    )
                }
            };
        },
        workspaceFail: (state, action: PayloadAction<string | null>) => {
            return { ...state, error: action.payload, isLoading: false };
        },
        workspaceReset: () => {
            return deepClone(workspaceInitialState);
        }
    }
});

export const {
    workspaceStarted,
    workspaceSuccess,
    workspaceFail,
    workspaceReset,
    workspaceUpdate
} = workSpaceSlice.actions;

export const fetchWorkspaces =
    ({ queryParams, authorization, workspace }: GetAllWorkspaceObject = {}) =>
    async (dispatch: Dispatch) => {
        dispatch(workspaceStarted());
        try {
            const res = await getAllWorkspaceAPI({ queryParams, authorization, workspace });
            if (res) {
                dispatch(workspaceSuccess(res));
            }
        } catch (error) {
            if (error instanceof Error) {
                dispatch(workspaceFail(error.message));
            } else {
                logger.error('fetchWorkspaces error: ', error);
            }
        }
    };
