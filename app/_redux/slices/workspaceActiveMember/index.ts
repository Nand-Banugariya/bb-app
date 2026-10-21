'use client';
import { Dispatch, PayloadAction, createSlice } from '@reduxjs/toolkit';
import { getWorkspaceActiveMemberAPI } from '@redux/services/workspace.api';
import { deepClone } from '@lib/helpers';
import { logger } from '@lib/logger';
import type { WorkspaceHasUser } from '../../models/member';

// Members who have joined the active workspace: assignee / mention pickers, the current
// user's role checks (settings permissions, global search).

export interface WorkspaceActiveMemberState {
    data: WorkspaceHasUser[];
    error?: string | null;
    isLoading?: boolean;
}

//==========initial state==============
const workspaceActiveMemberInitialState: WorkspaceActiveMemberState = {
    // An array, not `{}`: consumers call array methods on it before the first fetch resolves.
    data: [],
    error: null,
    isLoading: false
};

export const workspaceActiveMemberSlice = createSlice({
    name: 'workspaceActiveMember',
    initialState: deepClone(workspaceActiveMemberInitialState),
    reducers: {
        workspaceActiveMemberStarted: (state) => {
            return { ...state, isLoading: true };
        },
        workspaceActiveMemberSuccess: (state, action: PayloadAction<WorkspaceHasUser[]>) => {
            return { ...state, data: action.payload, error: null, isLoading: false };
        },
        workspaceActiveMemberFail: (state, action: PayloadAction<string | null>) => {
            return { ...state, error: action.payload, isLoading: false };
        },
        workspaceActiveMemberReset: () => {
            return deepClone(workspaceActiveMemberInitialState);
        }
    }
});

export const {
    workspaceActiveMemberStarted,
    workspaceActiveMemberSuccess,
    workspaceActiveMemberFail,
    workspaceActiveMemberReset
} = workspaceActiveMemberSlice.actions;

export const fetchWorkspaceActiveMember = (workspaceId: string) => async (dispatch: Dispatch) => {
    dispatch(workspaceActiveMemberStarted());
    try {
        const members = await getWorkspaceActiveMemberAPI({ workspaceId });
        if (members) {
            dispatch(workspaceActiveMemberSuccess(members));
        }
    } catch (error) {
        if (error instanceof Error) {
            dispatch(workspaceActiveMemberFail(error.message));
        } else {
            logger.error('fetchWorkspaceActiveMember error: ', error);
        }
    }
};
