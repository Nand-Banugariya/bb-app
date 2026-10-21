'use client';
import { Dispatch, PayloadAction, createSlice } from '@reduxjs/toolkit';
import { getAllProjectsAPI } from '@redux/services/projects.api';
import { deepClone } from '@lib/helpers';
import { logger } from '@lib/logger';
import type {
    GetAllProjectsObject,
    ProjectListResponse,
    ProjectObject
} from '../../models/project';

// The project list of a workspace. bb-app also loaded a single project into this same `data`
// (fetchProjectById), which made its shape depend on the last call; a single project is
// fetched with getProjectByIdAPI by the screen that needs it instead.

export interface ProjectState {
    data: ProjectListResponse;
    isLoading: boolean;
    error?: string | null;
}

//==========initial state==============
const projectInitialState: ProjectState = {
    data: { list: [] },
    isLoading: false,
    error: null
};

export const projectSlice = createSlice({
    name: 'project',
    initialState: deepClone(projectInitialState),
    reducers: {
        projectStarted: (state) => {
            return { ...state, isLoading: true };
        },
        projectSuccess: (state, action: PayloadAction<ProjectListResponse>) => {
            return { ...state, data: action.payload, error: null, isLoading: false };
        },
        /** Merges a changed project into the list (no-op when it isn't there). */
        projectUpdate: (state, action: PayloadAction<Partial<ProjectObject>>) => {
            const { id } = action.payload;
            if (!id || !state.data.list?.some((p) => p.id === id)) return state;
            return {
                ...state,
                data: {
                    ...state.data,
                    list: state.data.list.map((p) =>
                        p.id === id ? { ...p, ...action.payload } : p
                    )
                }
            };
        },
        projectFail: (state, action: PayloadAction<string | null>) => {
            return { ...state, error: action.payload, isLoading: false };
        },
        projectReset: () => {
            return deepClone(projectInitialState);
        }
    }
});

export const { projectSuccess, projectStarted, projectUpdate, projectFail, projectReset } =
    projectSlice.actions;

export const fetchProjects =
    ({ queryParams, authorization, workspace }: GetAllProjectsObject) =>
    async (dispatch: Dispatch) => {
        dispatch(projectStarted());
        try {
            const res = await getAllProjectsAPI({ queryParams, authorization, workspace });
            if (res) {
                dispatch(projectSuccess(res));
            }
        } catch (error) {
            if (error instanceof Error) {
                dispatch(projectFail(error.message));
            } else {
                logger.error('fetchProjects error: ', error);
            }
        }
    };
