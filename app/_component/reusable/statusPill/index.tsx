import * as React from 'react';
import { Badge } from '@components/base_shadcn/badge';

/**
 * Design system v2 · Session status pill: 22px, 12/500, tinted surface with a 6px dot.
 *   open → blue · in_progress → amber · done → green · urgent → red · closed → neutral
 */
type SessionStatus = 'open' | 'in_progress' | 'done' | 'urgent' | 'closed';

const STATUS: Record<
    SessionStatus,
    { label: string; variant: 'info' | 'warning' | 'success' | 'danger' | 'secondary' }
> = {
    open: { label: 'Open', variant: 'info' },
    in_progress: { label: 'In progress', variant: 'warning' },
    done: { label: 'Done', variant: 'success' },
    urgent: { label: 'Urgent', variant: 'danger' },
    closed: { label: 'Closed', variant: 'secondary' }
};

interface StatusPillProps extends Omit<React.ComponentProps<typeof Badge>, 'variant' | 'dot'> {
    status: SessionStatus;
    /** Overrides the default label, e.g. a workspace's custom status name. */
    label?: React.ReactNode;
}

function StatusPill({ status, label, ...props }: StatusPillProps) {
    const config = STATUS[status];
    return (
        <Badge variant={config.variant} dot {...props}>
            {label ?? config.label}
        </Badge>
    );
}

export { StatusPill, STATUS as SESSION_STATUS };
export type { StatusPillProps, SessionStatus };
