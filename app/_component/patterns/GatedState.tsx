import * as React from 'react';
import { LockIcon } from '@components/icons/material';
import { EmptyState } from './EmptyState';

interface GatedStateProps {
    /** Who can do this, plainly: "Only admins can change workspace settings". */
    title?: React.ReactNode;
    description?: React.ReactNode;
    /** e.g. "Ask an admin" / "Upgrade plan" (only when the viewer can act on it). */
    action?: React.ReactNode;
    icon?: React.ReactNode;
    className?: string;
}

/**
 * Shown instead of a page or section the viewer can't use. Check the role gate
 * before the plan gate, so members aren't told to upgrade a plan they can't buy.
 */
const GatedState = ({
    title = 'Only admins can change these settings',
    description = 'Ask a workspace admin if you need access.',
    action,
    icon = <LockIcon />,
    className
}: GatedStateProps) => (
    <EmptyState
        icon={icon}
        title={title}
        description={description}
        action={action}
        className={className}
    />
);

export { GatedState };
export type { GatedStateProps };
