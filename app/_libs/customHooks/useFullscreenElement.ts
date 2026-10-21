import { useSyncExternalStore } from 'react';

const subscribe = (onChange: () => void) => {
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
};

/**
 * The element currently shown full screen, or null.
 *
 * Only the fullscreen element's own subtree is rendered, so anything portalled to
 * `document.body` - popovers, tooltips - disappears while full screen is on. Passing this
 * as the portal container keeps that content inside the element that is actually visible.
 */
export const useFullscreenElement = () =>
    useSyncExternalStore(
        subscribe,
        () => (document.fullscreenElement as HTMLElement | null) ?? null,
        () => null
    );
