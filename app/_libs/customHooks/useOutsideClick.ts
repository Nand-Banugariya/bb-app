import { useEffect, useRef } from 'react';

type AnyEvent = MouseEvent | TouchEvent;

/**
 * Calls `callback` when the user clicks or touches outside all of `refs`.
 * Refs that aren't attached yet are ignored. (Doesn't see inside shadow DOM.)
 */
export function useOutsideClick(
    refs: React.RefObject<HTMLElement | null>[],
    callback: (event: AnyEvent) => void
) {
    const callbackRef = useRef(callback);
    const refsRef = useRef(refs);

    useEffect(() => {
        callbackRef.current = callback;
        refsRef.current = refs;
    });

    useEffect(() => {
        const listener = (event: AnyEvent) => {
            const target = event.target as Node | null;
            for (const ref of refsRef.current) {
                // Not mounted yet, or the click landed inside: ignore.
                if (!ref?.current || (target && ref.current.contains(target))) return;
            }
            callbackRef.current(event);
        };
        document.addEventListener('click', listener);
        document.addEventListener('touchstart', listener);
        return () => {
            document.removeEventListener('click', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, []);
}
