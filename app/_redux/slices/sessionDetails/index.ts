'use client';
/* eslint-disable @typescript-eslint/no-explicit-any -- ported from bb-app as-is; typed when its feature moves over */
import { Dispatch, createSlice } from '@reduxjs/toolkit';
import { deepClone } from '@lib/helpers';
import { logger } from '@lib/logger';
import { PaginateSuccessResponse } from '@redux/models/common';
import { getSessionDetailsAPI } from '@redux/services/sessionDetails.api';
import { BugCommentListObject, SubUserObject, bugCommentSuccess } from '../bugComment';
import { getSessionActivityLogsAPI } from '@redux/services/sessions.api';
import { bugActivityLogSuccess } from '../bugActivityLog';
import { CreationSource } from '@lib/types';

export interface RequestResponseHeader {
    name: string;
    value: string;
}

export interface BugHasNetwork {
    requestHeaders: RequestResponseHeader[];
    responseHeaders: RequestResponseHeader[];
    id: string;
    bugId: string;
    url: string;
    type: string;
    statusLine: string;
    statusCode: string;
    method: string;
    initiator: string;
    requestTime: string;
    responseTime: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    requestBody: unknown | any;
    response: unknown | any;
    timestamp: number;
}

export interface BugHasConsole {
    id: string;
    bugId: string;
    type: 'error' | 'log' | 'warn' | 'info' | string;
    args: (string | ArgsObject)[];
    timestamp: string;
    dateTime: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ConsoleLogsObject {
    id: string;
    sessionId: string;
    type: 'info' | 'warn' | 'debug' | 'error' | 'log' | 'networkError';
    args?: any;
    timestamp: number;
    dateTime: string;
    url: string;
    file: any[];
    createdAt: string;
}
export interface NetworkLogsObject {
    id: string;
    sessionId?: string;
    initiator?: string;
    method?: string;
    requestBody?: any;
    index: number;
    response?: string;
    startTime?: number;
    endTime?: number;
    requestHeaders?: {
        name?: string;
        value?: string;
    }[];
    requestTime?: number;
    responseHeaders?: {
        name?: string;
        value?: string;
    }[];
    responseTime?: number;
    statusCode?: number;
    statusLine?: string;
    type?: string;
    url?: string;
    createdAt: string;
    timestamp: number;
}

export interface ArgsObject {
    ev: {
        isTrusted: boolean;
    };
    state: string;
}

export interface ArgsTextContent {
    content: string;
    title: string;
}

export interface ExtendedBugHasConsole extends BugHasConsole {
    argsTextContent: ArgsTextContent;
}

export interface Screenshot {
    file: string;
    fullFile: string;
    isFullScreenShot: boolean;
    status: string | null;
    clickTimestamp: string | null;
    clickDateTime: string | null;
    startTimestamp: string | null;
    startDateTime: string | null;
    endTimestamp: string | null;
    endDateTime: string | null;
    timeout: number;
}

export interface BrowserInfo {
    name: string;
    version: string;
}

export interface EngineInfo {
    name: string;
    version: string;
}

export interface OsInfo {
    name: string;
    version: string;
}

export interface DeviceInfo {
    type: string;
    vendor: string;
    model: string;
}

export interface WindowSize {
    width: string;
    height: string;
}

interface GeoLocation {
    range: string;
    country: string;
    region: string;
    city: string;
    ll: [number, number];
    metro: number;
    area: number;
    eu: string;
    timezone: string;
}

export interface SystemInfo {
    url: string;
    userAgent: string;
    browser: BrowserInfo;
    engine: EngineInfo;
    os: OsInfo;
    device: DeviceInfo;
    windowOuterSize: WindowSize;
    windowInnerSize: WindowSize;
    scrollSize: WindowSize;
    extensionVersion: string;
    appVersion: string;
    ip: string;
    geoLocation: GeoLocation;
    logRocketURL: string;
    fullStoryURL: string;
    networkSpeed: string;
    batteryPercentage: string;
    isIncognito: boolean;
    isCharging: boolean;
    appBuildNumber: string;
    hardwareDetails: {
        totalDiskSpace: string;
        appVersion: string;
        cpuCount: string;
        ramSize: string;
        freeDiskSpace: string;
        activeCpuCount: string;
        cpuUsage: string;
    };
    sdkVersion: string;
    screenSize: string;
}

export interface IntegrationPlatform {
    name: string;
    displayName: string;
    logo: string;
}

export interface BugHasTag {
    id: string;
    bugId: string;
    userId: string;
    tagId: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface BugHasComment {
    id: string;
    bugId: string;
    userId: string;
    comment: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface BugHasViewer {
    id: string;
    bugId: string;
    userId: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface BugHasIntegration {
    id: string;
    bugId: string;
    userId: string;
    platformName: string;
    displayName: string;
    objectId: string;
    url: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    user: SubUserObject;
    platform: IntegrationPlatform;
}

export interface Project {
    name: string;
}

export interface Workspace {
    name: string;
    logo: string;
}

export interface CommentsList extends PaginateSuccessResponse {
    list: BugCommentListObject[];
}

export interface BugHasApplicationData {
    type?: 'cookie' | 'local' | 'session';
    args?:
        | {
              key?: string;
              value?: string;
          }
        | {
              name?: string;
              value?: string;
              domain?: string;
              expirationDate?: number;
              path?: string;
              secure?: boolean;
              httpOnly?: boolean;
              sameSite?: string;
              hostOnly?: boolean;
              session?: boolean;
              storeId?: string;
          };
    url?: string;
    timestamp?: number;
    dateTime?: string;
}

export interface SessionDetailsObject {
    metaData: any;
    screenshot: Screenshot;
    screenRecording: any | null;
    rewind: any | null;
    systemInfo: SystemInfo;
    pageInfo: any | null;
    id: string;
    workspaceId: string;
    projectId: string;
    userId: string;
    userEmail: string;
    title: string;
    description: string | null;
    type: string;
    sessionType: string;
    // Session-level submission time; set for reports with no captured evidence
    // so the Timestamp still renders (evidence blocks carry their own).
    clickDateTime?: string | null;
    attachments: any[];
    priority: string;
    evidence: any | null;
    bugPrivacy: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    project: Project;
    workspace: Workspace;
    bugHasConsole: BugHasConsole[];
    bugHasNetwork: BugHasNetwork[];
    bugHasIntegration: BugHasIntegration[];
    bugHasTag: BugHasTag[];
    bugHasViewer: BugHasViewer[];
    comments: CommentsList;
    permissions: string[];
    sessionHasScreenShot: any;
    user: SubUserObject;
    reporterEmail?: string;
    issueType?: string;
    customerResolutionEmailSentAt?: string | null;
    networkErrors: BugHasNetwork[];
    bugHasApplicationData: BugHasApplicationData[];
    creationSource: CreationSource;
    mentionableUsers: {
        id: string;
        name: string;
        email: string;
        image: string;
    }[];
    bugHasAssignee: {
        id: string;
        assignedTo: {
            name: string;
            email: string;
            image: string;
        };
        assignedBy: {
            name: string;
            email: string;
            image: string;
        };
    }[];
    highAdvocacy: { campaignId: string; triggerKey: string } | null;
}

export interface SessionDetailsSuccessResponse {
    data: SessionDetailsObject | any;
}

export interface SessionDetailsState {
    data?: SessionDetailsObject | any;
    error?: string | null;
    isLoading?: boolean;
}

const SessionDetailsInitialState: SessionDetailsState = {
    data: {},
    error: null,
    isLoading: false
};

export const sessionDetailsSlice = createSlice({
    name: 'sessionDetails',
    initialState: deepClone(SessionDetailsInitialState),
    reducers: {
        sessionDetailsStarted: (state) => {
            return {
                ...state,
                isLoading: true
            };
        },
        sessionDetailsSuccess: (state, action) => {
            return {
                ...state,
                ...{
                    data: action.payload,
                    error: null,
                    isLoading: false
                }
            };
        },
        sessionDetailsFail: (state, action) => {
            return {
                ...state,
                ...{ error: action.payload, isLoading: false }
            };
        },
        sessionDetailsReset: () => {
            return deepClone(SessionDetailsInitialState);
        }
    }
});

export const {
    sessionDetailsStarted,
    sessionDetailsSuccess,
    sessionDetailsFail,
    sessionDetailsReset
} = sessionDetailsSlice.actions;

export const fetchSessionDetails = (data: { bugId: string }) => async (dispatch: Dispatch) => {
    try {
        dispatch(sessionDetailsStarted());
        const sessionDetails = await getSessionDetailsAPI(data);
        if (sessionDetails) {
            dispatch(sessionDetailsSuccess(sessionDetails));
            dispatch(bugCommentSuccess(sessionDetails?.comments));
            const activityLogs = await getSessionActivityLogsAPI({
                workspaceId: sessionDetails?.workspaceId,
                projectId: sessionDetails?.projectId,
                bugId: sessionDetails?.id
            });
            dispatch(bugActivityLogSuccess(activityLogs));
        }
    } catch (error) {
        if (error instanceof Error) {
            dispatch(sessionDetailsFail(error.message));
        } else {
            logger.error('fetchSessionDetails error : ', error);
        }
    }
};
