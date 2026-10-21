import * as React from 'react';
import {
    CloseIcon,
    ErrorIcon,
    InfoIcon,
    WarningIcon,
    type IconProps
} from '@components/icons/material';
import { cn } from '@lib/utils';

/**
 * Design system v2 · Console & network rows (dev tools panel): 32px+ rows, 13px text, the level
 * colour on the icon only, a red/amber tint for errors and warnings, timestamp on the right.
 * Stack them inside `LogList` (radius 6, 1px ring, d100 dividers).
 *   error · warning · info (console) · failed (network request that errored, × icon)
 */
type LogLevel = 'error' | 'warning' | 'info' | 'failed';

const LEVELS: Record<
    LogLevel,
    { Icon: React.ComponentType<IconProps>; icon: string; row: string }
> = {
    error: { Icon: ErrorIcon, icon: 'text-danger', row: 'bg-danger-subtle' },
    warning: { Icon: WarningIcon, icon: 'text-warning', row: 'bg-warning-subtle' },
    info: { Icon: InfoIcon, icon: 'text-muted-foreground', row: '' },
    failed: { Icon: CloseIcon, icon: 'text-danger', row: '' }
};

interface LogRowProps extends React.ComponentProps<'div'> {
    level: LogLevel;
    message: React.ReactNode;
    /** Time in the recording, e.g. "0:38". */
    time?: React.ReactNode;
    /** Makes the row a button-like target (opens details). */
    onSelect?: () => void;
    selected?: boolean;
}

function LogRow({
    level,
    message,
    time,
    onSelect,
    selected = false,
    className,
    ...props
}: LogRowProps) {
    const { Icon, icon, row } = LEVELS[level];
    return (
        <div
            data-slot="log-row"
            data-level={level}
            role={onSelect ? 'button' : undefined}
            tabIndex={onSelect ? 0 : undefined}
            aria-selected={onSelect ? selected : undefined}
            onClick={onSelect}
            onKeyDown={
                onSelect
                    ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              onSelect();
                          }
                      }
                    : undefined
            }
            className={cn(
                'grid min-h-8 grid-cols-[1.25rem_minmax(0,1fr)_auto] items-center gap-2 border-t border-d100 px-2.5 py-1 text-sm first:border-t-0',
                row,
                onSelect &&
                    'cursor-pointer outline-none hover:bg-d100 focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-inset',
                selected && 'bg-sel',
                className
            )}
            {...props}>
            <Icon className={cn('size-4', icon)} />
            <span className="sr-only">{level}</span>
            <span className="truncate">{message}</span>
            {time !== undefined && (
                <span className="text-xs text-muted-foreground tabular-nums">{time}</span>
            )}
        </div>
    );
}

function LogList({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="log-list"
            className={cn('flex flex-col overflow-hidden rounded-md shadow-sh', className)}
            {...props}
        />
    );
}

export { LogRow, LogList };
export type { LogRowProps, LogLevel };
