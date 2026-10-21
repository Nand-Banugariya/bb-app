/**
 * App-wide constants. Only what the auth / login / SSO and onboarding flows need has been
 * ported from bb-app's constants.tsx so far — add the rest feature by feature as it moves over.
 */
import { env } from './env';

/** UTM sources that grant the 90-day free trial; only these are carried through login. */
export const UTM_SOURCES_FOR_FREE_TRIAL_90_DAYS = ['testflix'];

export const ERROR_MESSAGES = {
    catchCommonError: 'Something went wrong. Try again in a moment.',
    auth: {
        verificationCode: 'That code isn’t right. Check it and try again.',
        sessionRevoked: 'You were signed out because your account signed in somewhere else.',
        sessionExpired: 'Your session expired. Please sign in again.'
    },
    onboarding: {
        workspaceNotSelected: 'Choose a workspace',
        joinFailed: 'Couldn’t join the workspace. Try again.',
        requestFailed: 'Couldn’t send the access request. Try again.',
        acceptFailed: 'Couldn’t accept the invite. Try again.'
    }
};

export const SUCCESS_MESSAGES = {
    auth: {
        sentOTP: 'Code sent'
    },
    onboarding: {
        accessRequested: 'Access request sent',
        invitationAccepted: 'Invite accepted'
    }
};

export const INFO_MESSAGE = {
    captcha: {
        notLoaded: 'Captcha not loaded yet. Please wait for sometime.'
    }
};

export const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${env.githubClientId}&scope=user`;

// `userinfo.profile` is what makes Google return the `picture` claim. Without it the userinfo
// endpoint replies with only { id, email, verified_email }, so the API stores an empty image
// and every Google user falls back to a default avatar. Encoded up front because the two
// scopes are space-separated.
const GOOGLE_OAUTH_SCOPES = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
].join(' ');

export const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?scope=${encodeURIComponent(GOOGLE_OAUTH_SCOPES)}&redirect_uri=${env.googleRedirectUri}&response_type=code&client_id=${env.googleClientId}`;

export const getExtensionUrl =
    'https://chrome.google.com/webstore/detail/betterbugs-a-fresh-approa/mdljmlgokccncglfobogbfjgcijldnaj';

export const chromExtensionId = 'mdljmlgokccncglfobogbfjgcijldnaj';
export const edgeExtensionId = 'cbojiblepdmdpjngajmompgkadipidfb';

/* User onboarding (Onboarding v4) ------------------------------------------------------------ */

export const rolesOptions = [
    'Developer',
    'Tester / QA',
    'Product Manager',
    'Designer',
    'Founder / CXO',
    'Support / Sales',
    'Other'
];
export const industries = ['Software', 'E-commerce', 'FinTech', 'HealthTech', 'EdTech', 'Other'];
export const teamSizes = ['0-10', '10-50', '50-200', '200-500', '500+'];
export const heardAboutUs = [
    'Google',
    'LinkedIn',
    'Product Hunt',
    'Friend/Colleague',
    'Twitter/X',
    'Other'
];

/** Value sent for "None" in the tools question; it can't be picked together with a tool. */
export const PM_TOOL_NONE = 'none';

/**
 * Project management tools offered during onboarding. `key` is what bb-api stores in the user's
 * `PMTools` (the integration keys bb-app sent); logos live in public/images/pm-tools, with a
 * `-dark` variant for the monochrome ones.
 */
export const PM_TOOLS: { key: string; label: string; darkLogo?: boolean }[] = [
    { key: 'jira', label: 'Jira' },
    { key: 'click-up', label: 'ClickUp' },
    { key: 'linear', label: 'Linear' },
    { key: 'asana', label: 'Asana' },
    { key: 'trello', label: 'Trello' },
    { key: 'github', label: 'GitHub', darkLogo: true },
    { key: 'notion', label: 'Notion', darkLogo: true },
    { key: 'azure-boards', label: 'Azure Boards' },
    { key: 'gitlab', label: 'GitLab' },
    { key: 'bitbucket', label: 'Bitbucket' },
    { key: 'shortcut', label: 'Shortcut' },
    { key: PM_TOOL_NONE, label: 'None' }
];
