export const SUPPORT_EMAIL = 'support@betterbugs.io';

type GleapGlobal = {
    getInstance?: () => { initialized?: boolean };
    openConversations?: (showBackButton?: boolean) => void;
};

/**
 * Opens the in-app support chat (Gleap, when it has been loaded on the page). Where the chat
 * isn't available (signed-out pages, error screens, blocked by an extension) it falls back to
 * an email.
 */
export const contactSupport = (subject?: string) => {
    try {
        const gleap = (window as typeof window & { Gleap?: GleapGlobal }).Gleap;
        if (gleap?.getInstance?.().initialized && gleap.openConversations) {
            gleap.openConversations(true);
            return;
        }
    } catch {
        // Fall through to email.
    }
    window.location.href = `mailto:${SUPPORT_EMAIL}${
        subject ? `?subject=${encodeURIComponent(subject)}` : ''
    }`;
};
