'use client';

import * as React from 'react';
import { cn } from '@lib/utils';

// Each direct child fades up in turn, 60ms apart. Everything from the fifth
// child on comes in with the fifth, so long pages don't trickle in. A child
// marked `aria-busy` is a skeleton: it stays put, since it's taking over from
// the same skeleton in the route's loading.tsx and fading it would blink.
// (The delay selectors repeat the `:not(...)` so they outrank the animation
// shorthand, which resets the delay, whatever order Tailwind emits them in.)
const STAGGER =
    'motion-safe:[&>*:not([aria-busy=true])]:animate-reveal [&>*:not([aria-busy=true]):nth-child(2)]:[animation-delay:60ms] [&>*:not([aria-busy=true]):nth-child(3)]:[animation-delay:120ms] [&>*:not([aria-busy=true]):nth-child(4)]:[animation-delay:180ms] [&>*:not([aria-busy=true]):nth-child(n+5)]:[animation-delay:240ms]';
// After the first pass: a child that mounts later (a list taking over from
// its skeleton, a banner) still fades in, but straight away.
const SETTLED = 'motion-safe:[&>*:not([aria-busy=true])]:animate-reveal';
// Longest stagger slot (240ms) plus the 450ms animation.
const SETTLE_MS = 750;

interface RevealProps extends React.ComponentProps<'div'> {
    /** Bring each direct child in turn, top to bottom, instead of the block as one. */
    stagger?: boolean;
}

/**
 * Content arriving, whether a page opening or content taking over from its
 * loading skeleton: fades in and glides up 10px into place instead of
 * popping. Renders a plain div, so it can stand in for a page's root element
 * without changing the layout.
 */
const Reveal = ({ stagger, className, ...props }: RevealProps) => {
    const [settled, setSettled] = React.useState(false);

    React.useEffect(() => {
        if (!stagger) return;
        const timer = setTimeout(() => setSettled(true), SETTLE_MS);
        return () => clearTimeout(timer);
    }, [stagger]);

    return (
        <div
            className={cn(
                stagger ? (settled ? SETTLED : STAGGER) : 'motion-safe:animate-reveal',
                className
            )}
            {...props}
        />
    );
};

export { Reveal };
export type { RevealProps };
