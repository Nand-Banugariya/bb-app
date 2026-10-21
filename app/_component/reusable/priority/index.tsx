import * as React from 'react';
import {
    ErrorIcon,
    SignalCellularAlt1BarIcon,
    SignalCellularAlt2BarIcon,
    SignalCellularAltIcon,
    type IconProps
} from '@components/icons/material';
import { cn } from '@lib/utils';

/**
 * Design system v2 · Priority: 16px signal icon + 13px label.
 *   urgent (error, red) · high (3 bars, amber) · medium (2 bars, text colour) · low (1 bar, muted)
 */
type PriorityLevel = 'urgent' | 'high' | 'medium' | 'low';

const PRIORITY: Record<
    PriorityLevel,
    { label: string; Icon: React.ComponentType<IconProps>; className: string }
> = {
    urgent: { label: 'Urgent', Icon: ErrorIcon, className: 'text-danger' },
    high: { label: 'High', Icon: SignalCellularAltIcon, className: 'text-warning' },
    medium: { label: 'Medium', Icon: SignalCellularAlt2BarIcon, className: 'text-foreground' },
    low: { label: 'Low', Icon: SignalCellularAlt1BarIcon, className: 'text-muted-foreground' }
};

interface PriorityProps extends React.ComponentProps<'span'> {
    level: PriorityLevel;
    /** Icon only (keeps the label for screen readers). */
    iconOnly?: boolean;
}

function Priority({ level, iconOnly = false, className, ...props }: PriorityProps) {
    const { label, Icon, className: color } = PRIORITY[level];
    return (
        <span
            data-slot="priority"
            className={cn('inline-flex items-center gap-1.5 text-sm text-foreground', className)}
            {...props}>
            <Icon className={cn('size-4 shrink-0', color)} filled={level === 'urgent'} />
            <span className={cn(iconOnly && 'sr-only')}>{label}</span>
        </span>
    );
}

/** Just the coloured icon, for property rows and menus. */
function PriorityIcon({ level, className }: { level: PriorityLevel; className?: string }) {
    const { Icon, className: color } = PRIORITY[level];
    return <Icon className={cn('size-4 shrink-0', color, className)} />;
}

export { Priority, PriorityIcon, PRIORITY };
export type { PriorityProps, PriorityLevel };
