'use client';
/* eslint-disable @typescript-eslint/no-explicit-any -- ported from bb-app as-is; typed when its feature moves over */
import { Dispatch, createSlice } from '@reduxjs/toolkit';
import { deepClone } from '@lib/helpers';
import { logger } from '@lib/logger';
import { PaginateSuccessResponse, QueryParams } from '@redux/models/common';
import { getReactionsAPI } from '@redux/services/reaction.api';

export interface ReactionListObject {
    react: string;
    emoji: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ReactionObject extends PaginateSuccessResponse {
    list: Array<ReactionListObject>;
}

export interface ReactionSuccessResponse {
    data: ReactionObject | any;
}

export interface ReactionState {
    data?: ReactionObject | any;
    isLoading?: boolean;
    error?: string | null;
}

const reactionInitialState: ReactionState = {
    data: {},
    error: null,
    isLoading: false
};

export const reactionSlice = createSlice({
    name: 'reaction',
    initialState: deepClone(reactionInitialState),
    reducers: {
        reactionStarted: (state) => {
            return {
                ...state,
                isLoading: true
            };
        },
        reactionSuccess: (state, action) => {
            return {
                ...state,
                ...{
                    data: action.payload,
                    error: null,
                    isLoading: false
                }
            };
        },
        reactionFail: (state, action) => {
            return {
                ...state,
                ...{ error: action.payload, isLoading: false }
            };
        },
        reactionReset: () => {
            return deepClone(reactionInitialState);
        }
    }
});

export const { reactionStarted, reactionSuccess, reactionFail, reactionReset } =
    reactionSlice.actions;

export const fetchReactions =
    (data: { queryParams: QueryParams }) => async (dispatch: Dispatch) => {
        try {
            dispatch(reactionStarted());
            const reactions: ReactionSuccessResponse = await getReactionsAPI(data);
            if (reactions) {
                dispatch(reactionSuccess(reactions));
            }
        } catch (error) {
            if (error instanceof Error) {
                dispatch(reactionFail(error.message));
            } else {
                logger.error('fetchReactions error : ', error);
            }
        }
    };
