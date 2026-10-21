'use client';
import { useEffect, useRef, type DependencyList } from 'react';

/** Like useEffect, but skips the first run (fires only when `deps` change after mount). */
export default function useFirstEffect(fn: () => void, deps: DependencyList) {
    const isFirstRun = useRef(true);
    const fnRef = useRef(fn);

    useEffect(() => {
        fnRef.current = fn;
    });

    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }
        fnRef.current();
        // `deps` is the caller's dependency list.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
}
