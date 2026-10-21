import { useEffect } from 'react';

// How long the target is held in view after it mounts. Tables above it are
// often still loading, and filling in pushes it down the page.
const SETTLE_MS = 2500;

// Any of these means the user has taken over the scroll.
const USER_SCROLL_EVENTS = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const;

/**
 * Call from the component that renders the element with this `id`. When it
 * mounts with the URL hash at `#${id}` (a deep link, e.g. from global search),
 * scrolls the element into view and keeps it there while the content around
 * it finishes loading; lets go once the page settles or the user scrolls. A
 * hash-only change on a page that's already open is the router's to scroll.
 */
export const useScrollToHash = (id: string) => {
    useEffect(() => {
        if (window.location.hash !== `#${id}`) return;
        const el = document.getElementById(id);
        if (!el) return;

        const scroll = () => el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Fires once on observe (the first scroll) and again on each reflow.
        const observer = new ResizeObserver(scroll);
        observer.observe(el.parentElement ?? document.body);

        const stop = () => {
            observer.disconnect();
            window.clearTimeout(timer);
            USER_SCROLL_EVENTS.forEach((type) => window.removeEventListener(type, stop));
        };
        const timer = window.setTimeout(stop, SETTLE_MS);
        USER_SCROLL_EVENTS.forEach((type) =>
            window.addEventListener(type, stop, { passive: true })
        );
        return stop;
    }, [id]);
};
