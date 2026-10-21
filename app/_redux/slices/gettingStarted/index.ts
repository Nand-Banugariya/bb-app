'use client';
/* eslint-disable @typescript-eslint/no-explicit-any -- ported from bb-app as-is; typed when its feature moves over */
import { Dispatch, createSlice } from '@reduxjs/toolkit';
import { deepClone } from '@lib/helpers';
import { logger } from '@lib/logger';
import { getGettingStartedAPI, updateGettingStartedAPI } from '@redux/services/gettingStarted.api';
import { toast } from 'sonner';
import { toUserMessage } from '@lib/errors';

export type GettingStartedStepKey =
    | 'INSTALL_EXTENSION'
    | 'INVITE_TEAM'
    | 'CONNECT_INTEGRATION'
    | 'CONNECT_MCP'
    | 'CREATE_RECORDING_LINK'
    | 'INSTALL_SDK';

export type GettingStartedStepStatus = 'COMPLETED' | 'SKIPPED' | 'PENDING';

export type GettingStartedAction = 'SKIP' | 'UNSKIP' | 'COMPLETE' | 'DISMISS' | 'SKIP_LANDING';

export interface GettingStartedStep {
    key: GettingStartedStepKey;
    status: GettingStartedStepStatus;
    isSkippable: boolean;
}

export interface GettingStartedStatus {
    // Only users created after the checklist shipped are eligible.
    isEligible: boolean;
    isDismissed: boolean;
    // They left Get Started via "Go to Dashboard": no more landing redirects.
    skipLanding: boolean;
    // The extension has talked to bb-api for this user at least once.
    hasUsedExtension: boolean;
    // Steps that are COMPLETED or SKIPPED (bb-api counts both).
    completedCount: number;
    totalCount: number;
    steps: GettingStartedStep[];
}

// Steps off the checklist for now. bb-api already leaves them out; dropped
// here too so an API that still sends them (an older deploy) shows the same
// checklist, with counts to match.
const HIDDEN_STEPS: GettingStartedStepKey[] = ['INSTALL_SDK'];

const withoutHiddenSteps = (data: GettingStartedStatus): GettingStartedStatus => {
    if (!data?.steps?.some((step) => HIDDEN_STEPS.includes(step.key))) {
        return data;
    }
    const steps = data.steps.filter((step) => !HIDDEN_STEPS.includes(step.key));
    return {
        ...data,
        steps,
        completedCount: steps.filter((step) => step.status !== 'PENDING').length,
        totalCount: steps.length
    };
};

export interface GettingStartedState {
    data: GettingStartedStatus | null;
    workspaceId: string | null;
    // Who `data` belongs to, so a later login in the same tab never sees it.
    userId: string | null;
    error?: string | null;
    // The workspace the last failed GET was for: lets the page show an error
    // (and retry) for that workspace instead of loading forever.
    errorWorkspaceId?: string | null;
    // Workspaces with a GET in flight.
    loadingWorkspaceIds: string[];
}

const gettingStartedInitialState: GettingStartedState = {
    data: null,
    workspaceId: null,
    userId: null,
    error: null,
    errorWorkspaceId: null,
    loadingWorkspaceIds: []
};

export const gettingStartedSlice = createSlice({
    name: 'gettingStarted',
    initialState: deepClone(gettingStartedInitialState) as GettingStartedState,
    reducers: {
        gettingStartedStarted: (state, action: { payload: { workspaceId: string } }) => {
            const { workspaceId } = action.payload;
            // A retry clears that workspace's error, so the page shows it loading.
            const isRetry = state.errorWorkspaceId === workspaceId;
            return {
                ...state,
                error: isRetry ? null : state.error,
                errorWorkspaceId: isRetry ? null : state.errorWorkspaceId,
                loadingWorkspaceIds: state.loadingWorkspaceIds.includes(workspaceId)
                    ? state.loadingWorkspaceIds
                    : [...state.loadingWorkspaceIds, workspaceId]
            };
        },
        // Ends a GET without applying it (a newer response already landed).
        gettingStartedSettled: (state, action: { payload: { workspaceId: string } }) => {
            return {
                ...state,
                loadingWorkspaceIds: state.loadingWorkspaceIds.filter(
                    (id) => id !== action.payload.workspaceId
                )
            };
        },
        gettingStartedSuccess: (
            state,
            action: {
                payload: {
                    data: GettingStartedStatus;
                    workspaceId: string;
                    userId?: string | null;
                };
            }
        ) => {
            const { data, workspaceId, userId } = action.payload;
            return {
                ...state,
                data: withoutHiddenSteps(data),
                workspaceId,
                userId: userId ?? null,
                error: null,
                errorWorkspaceId: null,
                loadingWorkspaceIds: state.loadingWorkspaceIds.filter((id) => id !== workspaceId)
            };
        },
        gettingStartedFail: (
            state,
            action: { payload: { error: string; workspaceId: string } }
        ) => {
            const { error, workspaceId } = action.payload;
            return {
                ...state,
                error,
                errorWorkspaceId: workspaceId,
                loadingWorkspaceIds: state.loadingWorkspaceIds.filter((id) => id !== workspaceId)
            };
        },
        gettingStartedReset: () => {
            return deepClone(gettingStartedInitialState);
        }
    }
});

export const {
    gettingStartedStarted,
    gettingStartedSettled,
    gettingStartedSuccess,
    gettingStartedFail,
    gettingStartedReset
} = gettingStartedSlice.actions;

// Every GET/PATCH takes a number when it starts. Per workspace, a response
// older than one already applied is dropped, and a GET is also dropped when a
// PATCH started after it (the PATCH returns fresher data), so a slow GET fired
// on window focus can't revert a skip the user just made.
let requestSeq = 0;
const appliedSeq: Record<string, number> = {};
const lastMutationSeq: Record<string, number> = {};

export const fetchGettingStarted =
    (workspaceId: string, userId?: string | null) =>
    async (dispatch: Dispatch<any>, getState?: () => any) => {
        const state: GettingStartedState | undefined = getState?.()?.gettingStarted;
        if (state?.loadingWorkspaceIds?.includes(workspaceId)) {
            return;
        }
        const seq = ++requestSeq;
        dispatch(gettingStartedStarted({ workspaceId }));
        try {
            const data = await getGettingStartedAPI({ workspaceId });
            if (seq < (appliedSeq[workspaceId] ?? 0) || seq < (lastMutationSeq[workspaceId] ?? 0)) {
                dispatch(gettingStartedSettled({ workspaceId }));
                return data;
            }
            appliedSeq[workspaceId] = seq;
            dispatch(gettingStartedSuccess({ data, workspaceId, userId }));
            return data;
        } catch (error) {
            logger.error('fetchGettingStarted error : ', error);
            dispatch(
                gettingStartedFail({
                    error: toUserMessage(error, 'Something went wrong'),
                    workspaceId
                })
            );
            return null;
        }
    };

// Resolves to the refreshed status, or null if the update failed (a toast has
// already told the user).
export const updateGettingStarted =
    ({
        workspaceId,
        action,
        step,
        userId
    }: {
        workspaceId: string;
        action: GettingStartedAction;
        step?: GettingStartedStepKey;
        userId?: string | null;
    }) =>
    async (dispatch: Dispatch<any>, getState?: () => any) => {
        const seq = ++requestSeq;
        lastMutationSeq[workspaceId] = seq;
        try {
            const data = await updateGettingStartedAPI({ workspaceId, action, step });
            if (seq >= (appliedSeq[workspaceId] ?? 0)) {
                appliedSeq[workspaceId] = seq;
                dispatch(
                    gettingStartedSuccess({
                        data,
                        workspaceId,
                        userId: userId ?? getState?.()?.gettingStarted?.userId
                    })
                );
            }
            return data;
        } catch (error) {
            logger.error('updateGettingStarted error : ', error);
            toast.error(
                action === 'SKIP_LANDING'
                    ? "Couldn't save that. Please try again."
                    : "Couldn't update your checklist. Please try again."
            );
            return null;
        }
    };
