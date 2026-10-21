'use client';

import * as React from 'react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider as ShadcnTooltipProvider,
    TooltipTrigger
} from '../tooltip';
import { Kbd, KbdGroup } from '../kbd';
import { formatKey } from '@lib/customHooks/useHotkeys';

const isContentBlank = (content: React.ReactNode): boolean => {
    if (content === null || content === undefined) return true;
    if (typeof content === 'string') return content.trim() === '';
    if (typeof content === 'number') return false;
    if (Array.isArray(content))
        return content.length === 0 || content.every((item) => isContentBlank(item));
    return false;
};

interface BBTooltipProps {
    children: React.ReactNode;
    /** Tooltip text. Blank content renders the trigger alone. */
    content?: React.ReactNode;
    /** Keyboard shortcut shown after the label, e.g. `['mod', 'K']` or `['alt', 'S']`. */
    shortcut?: string[];
    side?: 'top' | 'right' | 'bottom' | 'left';
    sideOffset?: number;
    align?: 'start' | 'center' | 'end';
    contentClassName?: string;
    triggerAsChild?: boolean;
    triggerClassName?: string;
    /** Portal target — point it at the fullscreen element so the tooltip stays visible in fullscreen. */
    container?: HTMLElement | null;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    defaultOpen?: boolean;
    delayDuration?: number;
}

const ShortcutHint = ({ keys }: { keys: string[] }) => (
    <KbdGroup className="ml-1">
        {keys.map((key) => (
            <Kbd key={key}>{formatKey(key)}</Kbd>
        ))}
    </KbdGroup>
);

/**
 * Tooltip with the simplified `content` API (design system v2: inverted, 12/500, radius 6).
 * Icon-only buttons still need their own `aria-label` — the tooltip is a visual hint, not the
 * accessible name. Without `content`, children are composed from BBTooltipTrigger/Content.
 */
const BBTooltip = ({
    children,
    content,
    shortcut,
    side = 'top',
    sideOffset = 6,
    align = 'center',
    contentClassName,
    triggerAsChild = true,
    triggerClassName,
    container,
    open,
    onOpenChange,
    defaultOpen,
    delayDuration = 300
}: BBTooltipProps) => {
    if (content === undefined) {
        return (
            <Tooltip
                open={open}
                onOpenChange={onOpenChange}
                defaultOpen={defaultOpen}
                delayDuration={delayDuration}>
                {children}
            </Tooltip>
        );
    }

    if (isContentBlank(content)) return <>{children}</>;

    return (
        <Tooltip
            open={open}
            onOpenChange={onOpenChange}
            defaultOpen={defaultOpen}
            delayDuration={delayDuration}>
            <TooltipTrigger asChild={triggerAsChild} className={triggerClassName}>
                {children}
            </TooltipTrigger>
            <TooltipContent
                side={side}
                sideOffset={sideOffset}
                align={align}
                container={container}
                className={contentClassName}>
                {content}
                {shortcut?.length ? <ShortcutHint keys={shortcut} /> : null}
            </TooltipContent>
        </Tooltip>
    );
};
BBTooltip.displayName = 'BBTooltip';

const BBTooltipContent = (props: React.ComponentProps<typeof TooltipContent>) => (
    <TooltipContent {...props} />
);
BBTooltipContent.displayName = 'BBTooltipContent';

const BBTooltipTrigger = (props: React.ComponentProps<typeof TooltipTrigger>) => (
    <TooltipTrigger {...props} />
);
BBTooltipTrigger.displayName = 'BBTooltipTrigger';

/**
 * App-level provider (mounted in app/layout.tsx). Once one tooltip has shown, moving to the
 * next trigger within 300ms opens it without the delay.
 */
const BBTooltipProvider = ({
    delayDuration = 300,
    skipDelayDuration = 300,
    ...props
}: React.ComponentProps<typeof ShadcnTooltipProvider>) => (
    <ShadcnTooltipProvider
        delayDuration={delayDuration}
        skipDelayDuration={skipDelayDuration}
        {...props}
    />
);
BBTooltipProvider.displayName = 'BBTooltipProvider';

export { BBTooltip, BBTooltipContent, BBTooltipTrigger, BBTooltipProvider };
export type { BBTooltipProps };
