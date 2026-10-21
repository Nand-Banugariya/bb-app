'use client';
import { Dispatch, PayloadAction, createSlice } from '@reduxjs/toolkit';
import { getWorkspaceAllMemberAPI } from '@redux/services/workspace.api';
import { deepClone } from '@lib/helpers';
import { logger } from '@lib/logger';
import type { WorkspaceHasUser } from '../../models/member';

// Every member row of the active workspace, invited and requested ones included. Loaded by
// the sidebar when the workspace changes; read by members settings, invite and seat checks.

export interface MemberState {
    data: WorkspaceHasUser[];
    error?: string | null;
    isLoading?: boolean;
}

//==========initial state==============
const memberInitialState: MemberState = {
    data: [],
    error: null,
    isLoading: false
};

export const memberSlice = createSlice({
    name: 'members',
    initialState: deepClone(memberInitialState),
    reducers: {
        getMemberStarted: (state) => {
            return { ...state, isLoading: true };
        },
        getMemberSuccess: (state, action: PayloadAction<WorkspaceHasUser[]>) => {
            return { ...state, data: action.payload, error: null, isLoading: false };
        },
        getMemberFail: (state, action: PayloadAction<string | null>) => {
            return { ...state, error: action.payload, isLoading: false };
        },
        getMemberReset: () => {
            return deepClone(memberInitialState);
        },
        updateMemberRole: (state, action: PayloadAction<{ userId: string; role: string }>) => {
            const { userId, role } = action.payload;
            return {
                ...state,
                data: state.data.map((m) => (m.user?.id === userId ? { ...m, role } : m))
            };
        },
        removeMemberFromState: (state, action: PayloadAction<{ userId: string }>) => {
            const { userId } = action.payload;
            return { ...state, data: state.data.filter((m) => m.user?.id !== userId) };
        }
    }
});

export const {
    getMemberStarted,
    getMemberSuccess,
    getMemberFail,
    getMemberReset,
    updateMemberRole,
    removeMemberFromState
} = memberSlice.actions;

export const fetchWorkspaceMember = (workspaceId: string) => async (dispatch: Dispatch) => {
    dispatch(getMemberStarted());
    try {
        const members = await getWorkspaceAllMemberAPI({ workspaceId });
        if (members) {
            dispatch(getMemberSuccess(members));
        }
    } catch (error) {
        if (error instanceof Error) {
            dispatch(getMemberFail(error.message));
        } else {
            logger.error('fetchWorkspaceMember error: ', error);
        }
    }
};
