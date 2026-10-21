'use client';
/* eslint-disable @typescript-eslint/no-explicit-any -- ported from bb-app as-is; typed when its feature moves over */
import { Dispatch, createSlice } from '@reduxjs/toolkit';
import { deepClone } from '@lib/helpers';
import { logger } from '@lib/logger';
import {
    getConnectedProjectsForIntegrationAPI,
    getWorkspaceIntegrationsAPI
} from '@redux/services/integration.api';

export interface WorkspaceIntegrationObject {
    name: string;
    displayName: string;
    key: string;
    logo: string;
    status: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    platformType: string;
    workspaceHasUserIntegration: any;
    connectionLink: string;
    disconnectApiEndpoint: string;
    disconnectLink: string;
    maxIntegrationCredits: number;
    leftIntegrationCredits: number;
    hasCredits: boolean;
}

export interface WorkspaceIntegrationSuccessResponse {
    data: WorkspaceIntegrationObject[] | any;
}

export interface WorkspaceIntegrationState {
    data?: WorkspaceIntegrationObject[] | any;
    error?: string | null;
    isLoading?: boolean;
}

export interface WorkspaceIntegrationDataPayload {
    workspaceId: string;
}

//==========initial state==============
const workspaceIntegrationInitialState: WorkspaceIntegrationState = {
    data: {},
    error: null,
    isLoading: false
};

export const workspaceIntegrationSlice = createSlice({
    name: 'workspaceIntegration',
    initialState: deepClone(workspaceIntegrationInitialState),
    reducers: {
        workspaceIntegrationStarted: (state) => {
            return {
                ...state,
                isLoading: true
            };
        },
        workspaceIntegrationSuccess: (state, action) => {
            return {
                ...state,
                ...{
                    data: action.payload,
                    error: null,
                    isLoading: false
                }
            };
        },
        workspaceIntegrationFail: (state, action) => {
            return {
                ...state,
                ...{ error: action.payload, isLoading: false }
            };
        },
        workspaceIntegrationReset: () => {
            return deepClone(workspaceIntegrationInitialState);
        }
    }
});

export const {
    workspaceIntegrationStarted,
    workspaceIntegrationSuccess,
    workspaceIntegrationFail,
    workspaceIntegrationReset
} = workspaceIntegrationSlice.actions;

export const fetchWorkspaceIntegration =
    (workspaceId: string) => async (dispatch: Dispatch<any>, getState?: () => any) => {
        const status = getState?.()?.workspaceIntegration?.isLoading || false;
        if (status) {
            return;
        }
        dispatch(workspaceIntegrationStarted());
        try {
            const [workspaceIntegrationResponse, connectedProjectsForIntegration] =
                await Promise.all([
                    getWorkspaceIntegrationsAPI({
                        workspaceId
                    }),
                    getConnectedProjectsForIntegrationAPI({
                        workspaceId
                    })
                ]);

            const connectedProjectsForIntegrationMap = new Map();
            connectedProjectsForIntegration.forEach((item: any) => {
                connectedProjectsForIntegrationMap.set(
                    item.key,
                    item.workspaceHasUserIntegration?.map((item: any) => item.projectId)
                );
            });
            if (workspaceIntegrationResponse) {
                const workspaceIntegrationData = workspaceIntegrationResponse.map((item: any) => ({
                    ...item,
                    connectedProjects: connectedProjectsForIntegrationMap.get(item.key)
                }));
                dispatch(workspaceIntegrationSuccess(workspaceIntegrationData));
                return workspaceIntegrationData;
            }
        } catch (error) {
            if (error instanceof Error) {
                dispatch(workspaceIntegrationFail(error.message));
            } else {
                logger.error('fetchWorkspaceIntegration error : ', error);
            }
            return null;
        }
    };
