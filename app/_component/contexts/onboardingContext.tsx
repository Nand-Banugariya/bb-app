'use client';

import * as React from 'react';
import { useCookies } from 'react-cookie';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
    acceptInvitationAPI,
    getOnboardingUserWorkspacesAPI,
    updateOnboardingAPI,
    updateOnboardingUserDataAPI,
    type OnboardingWorkspacesResponse
} from '@redux/services/auth.api';
import { createFirstWorkspaceAPI } from '@redux/services/workspace.api';
import { fetchLoginUser } from '@redux/slices/auth';
import type { AppDispatch } from '@redux/store';
import { persistAuthPayload } from '@lib/auth/authCookie';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@lib/constants';
import { toUserMessage } from '@lib/errors';
import { BB_UID_COOKIE, getAnalyticsCookieOptions } from '@lib/helpers';
import { logger } from '@lib/logger';

/** A user's membership row on an onboarding workspace (INVITED, REQUESTED, ENABLED …). */
export interface OnboardingMembership {
    userId?: string;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
    [key: string]: unknown;
}

/**
 * Workspace a user can join because it matches their email domain, or was invited to. The
 * onboarding pages own the full shape; login only passes the list through.
 */
export interface OnboardingDomain {
    id: string;
    name?: string;
    logo?: string;
    workspaceHasUser?: OnboardingMembership[];
    [key: string]: unknown;
}

/**
 * Moves the user's `from` membership row to `to`, or adds a `to` row when there isn't one, so
 * the list shows the new state without refetching.
 */
const withMembership = (
    workspace: OnboardingDomain,
    userId: string | undefined,
    from: string,
    to: string
): OnboardingDomain => {
    const now = new Date().toISOString();
    const rows = workspace.workspaceHasUser || [];
    const index = rows.findIndex((m) => m?.userId === userId && m?.status === from);
    return {
        ...workspace,
        workspaceHasUser:
            index > -1
                ? rows.map((m, i) => (i === index ? { ...m, status: to, updatedAt: now } : m))
                : [...rows, { userId, status: to, createdAt: now, updatedAt: now }]
    };
};

/** User onboarding (Onboarding v4): 1 profile, 2 tools, 3 workspace ready. */
export type OnboardingStep = 1 | 2 | 3;

/** Answers from the user onboarding form, as the form holds them. */
export interface UserOnboardingForm {
    name: string;
    role: string;
    industry: string;
    /** Country name; optional. */
    country: string;
    teamSize: string;
    /** PM tool keys (see PM_TOOLS). */
    tools: string[];
    heardFrom: string;
}

/**
 * Sign-in / onboarding state shared across the auth pages (port of bb-app's onboardingContext):
 * the login and SSO pages use the campaign token and domain list; user onboarding adds its step
 * (the right panel follows it) and the submit flow; workspace onboarding adds join / request
 * access / accept invite.
 */
interface OnboardingContextValue {
    /** Campaign token (?utm_source) carried into sign-up for the extended free trial. */
    utmSourceToken: string | null;
    setUTMSourceToken: React.Dispatch<React.SetStateAction<string | null>>;
    onboardingDomains: OnboardingDomain[];
    setOnboardingDomains: React.Dispatch<React.SetStateAction<OnboardingDomain[]>>;
    invitedWorkspaces: OnboardingDomain[];
    setInvitedWorkspaces: React.Dispatch<React.SetStateAction<OnboardingDomain[]>>;
    /** Which onboarding form is submitting, if any. */
    submittingForm: string | null;
    setSubmittingForm: React.Dispatch<React.SetStateAction<string | null>>;
    onboardingStep: OnboardingStep;
    setOnboardingStep: React.Dispatch<React.SetStateAction<OnboardingStep>>;
    isFetchingWorkspaces: boolean;
    /** The workspaces lookup failed, so it isn't known whether the user has a team to join. */
    hasWorkspacesFetchError: boolean;
    /** Loads the workspaces the user can join; undefined when the lookup failed. */
    fetchUserWorkspaces: () => Promise<OnboardingWorkspacesResponse | undefined>;
    isSubmitting: boolean;
    /**
     * Saves the profile. With no team to join, creates the user's first workspace and moves to
     * the "workspace ready" step; otherwise goes on to workspace onboarding to join one.
     */
    handleUserOnboardingSubmit: (form: UserOnboardingForm) => Promise<void>;
    /**
     * Joins the chosen domain workspaces, then refreshes loginUser (now workspace-onboarded).
     * Resolves true on success; `submittingForm` stays 'JOIN' while the page moves on.
     */
    onJoinOnboardingWorkspace: (workspaceIds: string[]) => Promise<boolean>;
    /** Requests access to workspaces that approve joiners manually; marks them REQUESTED. */
    onRequestOnboardingWorkspace: (
        workspaceIds: string[],
        utmSource?: string | null
    ) => Promise<void>;
    /** Accepts an invitation; marks the workspace's membership ENABLED. Resolves true on success. */
    onInviteAcceptWorkspace: (workspaceId: string, invitationToken: string) => Promise<boolean>;
}

const OnboardingContext = React.createContext<OnboardingContextValue | null>(null);

function OnboardingProvider({ children }: { children: React.ReactNode }) {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const [, setCookie] = useCookies([BB_UID_COOKIE]);
    const [utmSourceToken, setUTMSourceToken] = React.useState<string | null>(null);
    const [onboardingDomains, setOnboardingDomains] = React.useState<OnboardingDomain[]>([]);
    const [invitedWorkspaces, setInvitedWorkspaces] = React.useState<OnboardingDomain[]>([]);
    const [submittingForm, setSubmittingForm] = React.useState<string | null>(null);
    const [onboardingStep, setOnboardingStep] = React.useState<OnboardingStep>(1);
    const [isFetchingWorkspaces, setIsFetchingWorkspaces] = React.useState(false);
    const [hasWorkspacesFetchError, setHasWorkspacesFetchError] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const fetchUserWorkspaces = React.useCallback(async () => {
        setIsFetchingWorkspaces(true);
        setHasWorkspacesFetchError(false);
        try {
            const response = await getOnboardingUserWorkspacesAPI();
            if (response?.domainWorkspaces?.length) setOnboardingDomains(response.domainWorkspaces);
            if (response?.invitedWorkspaces?.length) {
                setInvitedWorkspaces(response.invitedWorkspaces);
            }
            return response ?? {};
        } catch (error) {
            logger.error('Error fetching user workspaces:', error);
            setHasWorkspacesFetchError(true);
            return undefined;
        } finally {
            setIsFetchingWorkspaces(false);
        }
    }, []);

    const handleUserOnboardingSubmit = React.useCallback(
        async (form: UserOnboardingForm) => {
            setIsSubmitting(true);
            try {
                await updateOnboardingUserDataAPI({
                    name: form.name.trim(),
                    companyRole: form.role,
                    industry: form.industry,
                    companyLocation: form.country || undefined,
                    companySize: form.teamSize,
                    PMTools: form.tools,
                    heardFrom: form.heardFrom
                });
            } catch (error) {
                logger.error('Error updating onboarding data:', error);
                toast.error(toUserMessage(error, 'Couldn’t save your details. Try again.'));
                setIsSubmitting(false);
                return;
            }

            // Nobody to join: their workspace is created right here. A failed lookup isn't
            // "nobody to join" — workspace onboarding retries it before creating anything.
            const workspaces = await fetchUserWorkspaces();
            const hasTeamToJoin =
                !!workspaces?.domainWorkspaces?.length || !!workspaces?.invitedWorkspaces?.length;
            if (workspaces && !hasTeamToJoin) {
                try {
                    await createFirstWorkspaceAPI();
                    // Refresh loginUser so the new workspace and onboarding flags are in the store.
                    await dispatch(fetchLoginUser());
                    setOnboardingStep(3);
                    setIsSubmitting(false);
                    return;
                } catch (error) {
                    // Workspace onboarding tries again (and offers to create one).
                    logger.error('Error creating workspace:', error);
                }
            }

            router.push('/workspace/onboarding');
        },
        [dispatch, fetchUserWorkspaces, router]
    );

    const onJoinOnboardingWorkspace = React.useCallback(
        async (workspaceIds: string[]) => {
            if (!workspaceIds.length) {
                toast.error(ERROR_MESSAGES.onboarding.workspaceNotSelected);
                return false;
            }
            setSubmittingForm('JOIN');
            try {
                const response = await updateOnboardingAPI({ workspaceIds, utmSourceToken });
                const accessToken = response?.session?.accessToken;
                await dispatch(
                    fetchLoginUser(
                        accessToken ? { authorization: `Bearer ${accessToken}` } : undefined
                    )
                );
                return true;
            } catch (error) {
                logger.error('Error joining onboarding workspace:', error);
                toast.error(toUserMessage(error, ERROR_MESSAGES.onboarding.joinFailed));
                setSubmittingForm(null);
                return false;
            }
        },
        [dispatch, utmSourceToken]
    );

    const onRequestOnboardingWorkspace = React.useCallback(
        async (workspaceIds: string[], utmSource?: string | null) => {
            setSubmittingForm(workspaceIds.length === 1 ? workspaceIds[0] : null);
            try {
                const response = await updateOnboardingAPI({
                    workspaceIds,
                    utmSourceToken: utmSource ?? utmSourceToken ?? null
                });
                const userId = response?.user?.id;
                setOnboardingDomains((prev) =>
                    prev.map((workspace) =>
                        workspaceIds.includes(workspace.id)
                            ? withMembership(workspace, userId, 'REQUESTED', 'REQUESTED')
                            : workspace
                    )
                );
                // Only the session is stored: the workspace, project and landing URL are set
                // once the request is approved and the user can actually open them.
                persistAuthPayload({
                    user: { email: response?.user?.email, name: response?.user?.name || '' },
                    session: response?.session
                });
                if (userId) setCookie(BB_UID_COOKIE, userId, getAnalyticsCookieOptions());
                toast.success(SUCCESS_MESSAGES.onboarding.accessRequested);
            } catch (error) {
                logger.error('Error requesting onboarding workspace:', error);
                toast.error(toUserMessage(error, ERROR_MESSAGES.onboarding.requestFailed));
            } finally {
                setSubmittingForm(null);
            }
        },
        [setCookie, utmSourceToken]
    );

    const onInviteAcceptWorkspace = React.useCallback(
        async (workspaceId: string, invitationToken: string) => {
            setSubmittingForm(invitationToken);
            try {
                const response = await acceptInvitationAPI({ payload: { invitationToken } });
                setInvitedWorkspaces((prev) =>
                    prev.map((workspace) =>
                        workspace.id === workspaceId
                            ? withMembership(workspace, response?.user?.id, 'INVITED', 'ENABLED')
                            : workspace
                    )
                );
                toast.success(SUCCESS_MESSAGES.onboarding.invitationAccepted);
                return true;
            } catch (error) {
                logger.error('Error accepting workspace invitation:', error);
                toast.error(toUserMessage(error, ERROR_MESSAGES.onboarding.acceptFailed));
                return false;
            } finally {
                setSubmittingForm(null);
            }
        },
        []
    );

    const value = React.useMemo(
        () => ({
            utmSourceToken,
            setUTMSourceToken,
            onboardingDomains,
            setOnboardingDomains,
            invitedWorkspaces,
            setInvitedWorkspaces,
            submittingForm,
            setSubmittingForm,
            onboardingStep,
            setOnboardingStep,
            isFetchingWorkspaces,
            hasWorkspacesFetchError,
            fetchUserWorkspaces,
            isSubmitting,
            handleUserOnboardingSubmit,
            onJoinOnboardingWorkspace,
            onRequestOnboardingWorkspace,
            onInviteAcceptWorkspace
        }),
        [
            utmSourceToken,
            onboardingDomains,
            invitedWorkspaces,
            submittingForm,
            onboardingStep,
            isFetchingWorkspaces,
            hasWorkspacesFetchError,
            fetchUserWorkspaces,
            isSubmitting,
            handleUserOnboardingSubmit,
            onJoinOnboardingWorkspace,
            onRequestOnboardingWorkspace,
            onInviteAcceptWorkspace
        ]
    );

    return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

function useOnboardingContext() {
    const context = React.useContext(OnboardingContext);
    if (!context)
        throw new Error('useOnboardingContext must be used within an OnboardingProvider.');
    return context;
}

export { OnboardingProvider, OnboardingContext, useOnboardingContext };
export type { OnboardingContextValue };
