'use client';
import { Dispatch, PayloadAction, createSlice } from '@reduxjs/toolkit';
import { toast } from 'sonner';
import { getLoginUser, loginAPI, loginConfirmAPI, logoutAPI } from '@redux/services/auth.api';
import { asSessionConflict } from '@lib/auth/authErrors';
import { deepClone } from '@lib/helpers';
import { logger } from '@lib/logger';
import { analytics } from '@lib/analytics';
import { toUserMessage } from '@lib/errors';
import type { ProjectObject } from '../../models/project';
import type { WorkspaceObject } from '../../models/workspace';

export interface UserSessionObject {
    id: string;
    userId: string;
    isFromAdmin: boolean;
    accessToken: string;
    geoIpCountry: string;
    ipAddress: string;
    userAgent: string;
    status: string;
    expiredAt: null | string;
    loginAt: string;
    expireAt: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UserObject {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    security: null | any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tempEmail: null | any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resetPasswordData: null | any;
    id: string;
    name: string;
    email: string;
    authType: string;
    timezone: string;
    dateFormat: string;
    status: string;
    isDeleted: boolean;
    lastLogin: string;
    createdAt: string;
    updatedAt: string;
    image: string;
    isOnboarded?: boolean;
    isWorkspaceOnboarded?: boolean;
    isSSOOnboarded?: boolean;
    samlFlowId?: string | null;
}

export interface LoginDataResponse {
    user: UserObject;
    session: UserSessionObject;
    workspaceId: string;
    projectId: string;
    workspaceIds: string[];
    adminWorkspaceIds: string[];
    isOwner: boolean;
    role: string;
    projectRole: string;
    workspace: WorkspaceObject;
    project: ProjectObject;
    workspaces: WorkspaceObject[];
    baseUrl: string;
    otpRef?: string;
    doOnboarding?: boolean;
    hasWorkspace?: boolean;
    /** Seconds until the access token expires (managed sessions only). */
    expiresIn?: number;
}

export interface LoginSuccessResponse {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: LoginDataResponse | any;
}

// A SESSION_CONFLICT (409) on a login-family call — the account already has an active session
// on another device. `method` is threaded through so the dialog's confirm action knows which
// analytics `login_successfull` method to report once /auth/login/confirm succeeds.
export interface SessionConflictState {
    message: string;
    existingSession?: { deviceLabel?: string; ipAddress?: string; lastActiveAt?: string };
    confirmationToken: string;
    method: 'email' | 'github' | 'google';
}

export interface LoginState {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: LoginDataResponse | any;
    isLoading?: boolean;
    error?: string | null;
    sessionConflict?: SessionConflictState | null;
}

export interface LoginUserState {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: LoginDataResponse | any;
    isLogin?: boolean;
    error?: string | null;
    isLoading?: boolean;
}

//========for payload=========
export interface LoginPayload {
    email: string;
}

export interface LoginUserPayload {
    authorization: string;
    workspace?: string;
}

export interface LogoutUserPayload {
    sessionId: string;
    noApiCall?: boolean;
    // Non-user-initiated logout cause (e.g. 'whoami_unauthorized'); forwarded to the logout API
    // so it is filterable in observability. Undefined for a user clicking "log out".
    reason?: string;
}

//==========initial state==============
const loginInitialState: LoginState = {
    data: {},
    error: null,
    isLoading: false,
    sessionConflict: null
};

const loginUserInitialState: LoginUserState = {
    data: {},
    error: null,
    isLogin: false,
    isLoading: false
};

export const loginSlice = createSlice({
    name: 'login',
    initialState: deepClone(loginInitialState),
    reducers: {
        loginStarted: (state) => {
            return { ...state, isLoading: true };
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        loginSuccess: (state, action: PayloadAction<any>) => {
            return { ...state, data: action.payload, error: null, isLoading: false };
        },
        loginFail: (state, action: PayloadAction<string | null>) => {
            return { ...state, error: action.payload, isLoading: false };
        },
        // Deliberately does not set `error` — the loginState effect in login.controller.tsx
        // resets/re-renders the Turnstile captcha whenever `error` is set, which is wrong for a
        // conflict (it's not a captcha failure). The conflict dialog's cancel handler resets
        // the captcha itself instead.
        loginSessionConflict: (state, action: PayloadAction<SessionConflictState>) => {
            return { ...state, sessionConflict: action.payload, isLoading: false, error: null };
        },
        loginConflictReset: (state) => {
            return { ...state, sessionConflict: null };
        },
        loginReset: () => {
            return deepClone(loginInitialState);
        }
    }
});

export const loginUserSlice = createSlice({
    name: 'loginUser',
    initialState: deepClone(loginUserInitialState),
    reducers: {
        loginUserStarted: (state) => {
            return { ...state, isLoading: true };
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        loginUserSuccess: (state, action: PayloadAction<any>) => {
            return { ...state, data: action.payload, error: null, isLoading: false, isLogin: true };
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        loginUserUpdate: (state, action: PayloadAction<any>) => {
            return {
                ...state,
                data: { ...state.data, ...action.payload },
                error: null,
                isLoading: false,
                isLogin: true
            };
        },
        loginUserFail: (state, action: PayloadAction<string | null>) => {
            return { ...state, error: action.payload, isLoading: false };
        },
        loginUserReset: () => {
            return deepClone(loginUserInitialState);
        }
    }
});

export const {
    loginSuccess,
    loginStarted,
    loginFail,
    loginReset,
    loginSessionConflict,
    loginConflictReset
} = loginSlice.actions;

export const {
    loginUserSuccess,
    loginUserStarted,
    loginUserUpdate,
    loginUserFail,
    loginUserReset
} = loginUserSlice.actions;

export const doLogin = (data: LoginPayload) => async (dispatch: Dispatch) => {
    dispatch(loginStarted());
    try {
        const response = await loginAPI(data);
        if (response) {
            if (response?.otpRef) {
                dispatch(loginSuccess(response));
            } else {
                dispatch(loginSuccess({ ...response, doOnboarding: true }));
            }
        }
    } catch (error) {
        const conflict = asSessionConflict(error);
        if (conflict) {
            dispatch(loginSessionConflict({ ...conflict, method: 'email' }));
            return;
        }
        if (error instanceof Error) {
            toast.error(toUserMessage(error, 'Couldn’t sign you in. Try again.'));
            dispatch(loginFail(error.message));
        } else {
            logger.error('doLogin error: ', error);
        }
    }
};

// Rejoins a login that hit a SESSION_CONFLICT (409) after the user confirmed they want to sign
// the other device out. `loginSuccess` with `doOnboarding: true` deliberately mirrors doLogin's
// non-OTP success shape so login.controller.tsx's loginState effect routes this through the
// same handleOnBoarding(...) funnel as every other entry point — same cookie write, same
// fetchLoginUser dispatch, same onboarding branching.
export const doLoginConfirm =
    (params: { confirmationToken: string; method: 'email' | 'github' | 'google' }) =>
    async (dispatch: Dispatch) => {
        dispatch(loginStarted());
        try {
            const response = await loginConfirmAPI({
                confirmationToken: params.confirmationToken
            });
            dispatch(loginConflictReset());
            if (response) {
                dispatch(
                    loginSuccess({ ...response, doOnboarding: true, loginMethod: params.method })
                );
            }
        } catch (error) {
            dispatch(loginConflictReset());
            if (error instanceof Error) {
                toast.error(toUserMessage(error, 'Couldn’t sign you in. Try again.'));
                dispatch(loginFail(error.message));
            } else {
                logger.error('doLoginConfirm error: ', error);
            }
        }
    };

// `method` is kept from bb-app's signature (callers pass it); who-am-i doesn't use it.
type FetchLoginUser = (
    data?: LoginUserPayload,
    method?: 'email' | 'github' | 'google' | 'sso'
) => (dispatch: Dispatch) => Promise<void>;

export const fetchLoginUser: FetchLoginUser = (data) => async (dispatch: Dispatch) => {
    dispatch(loginUserStarted());
    try {
        const auth = await getLoginUser(data || {});
        if (auth) {
            if (!localStorage.getItem('hasSeenFeatures')) {
                localStorage.setItem('hasSeenFeatures', 'false');
            }
            dispatch(loginUserSuccess(auth));
        }
    } catch (error) {
        if (error instanceof Error) {
            dispatch(loginUserFail(error.message));
        } else {
            logger.error('fetchLoginUser error: ', error);
        }
    }
};

export const logoutUser = async (data: LogoutUserPayload) => {
    try {
        analytics.reset();
        if (!data.noApiCall) {
            await logoutAPI({ sessionId: data?.sessionId, reason: data?.reason });
        }
    } catch (error) {
        logger.error('LogoutUser', error);
    }
};
