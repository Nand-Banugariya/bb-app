'use client';
/* eslint-disable @typescript-eslint/no-explicit-any -- ported from bb-app as-is; typed when its feature moves over */
import { Dispatch, createSlice } from '@reduxjs/toolkit';
import { deepClone } from '@lib/helpers';
import { logger } from '@lib/logger';
import { getProjectIntegrationsAPI } from '@redux/services/integration.api';

export interface ProjectIntegrationObject {
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
    subscriptionPlanId: string;
    hasCredits: boolean;
    maxIntegrationCredits: number;
    leftIntegrationCredits: number;
}

export interface ProjectIntegrationSuccessResponse {
    data: ProjectIntegrationObject[] | any;
}

export interface ProjectIntegrationState {
    data?: ProjectIntegrationObject[] | any;
    isLoading?: boolean;
    error?: string | null;
}

const projectintegrationInitialState: ProjectIntegrationState = {
    data: [],
    error: null,
    isLoading: false
};

export const projectintegrationSlice = createSlice({
    name: 'projectintegration',
    initialState: deepClone(projectintegrationInitialState),
    reducers: {
        projectintegrationStarted: (state) => {
            return {
                ...state,
                isLoading: true
            };
        },
        projectintegrationSuccess: (state, action) => {
            return {
                ...state,
                ...{
                    data: action.payload,
                    error: null,
                    isLoading: false
                }
            };
        },
        projectintegrationFail: (state, action) => {
            return {
                ...state,
                ...{ error: action.payload, isLoading: false }
            };
        }
    }
});

export const { projectintegrationStarted, projectintegrationSuccess, projectintegrationFail } =
    projectintegrationSlice.actions;

export const fetchProjectIntegrations =
    (data: { workspaceId: string; projectId: string }) => async (dispatch: Dispatch) => {
        try {
            dispatch(projectintegrationStarted());
            const projectintegration: ProjectIntegrationSuccessResponse =
                await getProjectIntegrationsAPI(data);
            if (projectintegration) {
                dispatch(projectintegrationSuccess(projectintegration));
            }
        } catch (error) {
            if (error instanceof Error) {
                dispatch(projectintegrationFail(error.message));
            } else {
                logger.error('fetchProjectIntegrations error: ', error);
            }
        }
    };
