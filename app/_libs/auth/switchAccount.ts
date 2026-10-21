import { logoutUser } from '@redux/slices/auth';
import { logger } from '@lib/logger';
import { delete_cookie } from '@lib/helpers';
import { stopRefreshLifecycle } from './refreshClient';

/**
 * Signs the current user out and sends them to `loginPath` — the "Switch account" action on
 * invite / join / approve pages, where the link was meant for a different account than the one
 * that's signed in. `loginPath` should carry the invite token so the new sign-in lands back on
 * the invite.
 */
export const switchAccount = async ({
    sessionId,
    loginPath
}: {
    sessionId?: string;
    loginPath: string;
}) => {
    stopRefreshLifecycle();
    try {
        if (sessionId) {
            await logoutUser({ noApiCall: false, sessionId });
            // bb-app also cleared the Gleap identity here; add that back when Gleap is wired.
        }
    } catch (error) {
        logger.error(error);
    }
    delete_cookie('auth');
    localStorage.removeItem('onboarding_form_data');
    localStorage.removeItem('invitedUsers');
    window.location.href = loginPath;
};
