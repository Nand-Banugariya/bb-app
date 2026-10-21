import * as React from 'react';
import { cn } from '@lib/utils';

interface UsageMeterProps {
    used: number;
    /** `null` / `undefined` = unlimited. */
    limit?: number | null;
    /** What's being counted, e.g. "sessions". */
    unit?: string;
    label?: React.ReactNode;
    /** Share of the limit at which the bar turns amber (default 0.8). */
    warnAt?: number;
    size?: 'sm' | 'md';
    /** Hide the "12 of 50 sessions" line (the bar keeps its accessible value). */
    hideValue?: boolean;
    className?: string;
}

/**
 * Usage state for a used/limit pair: `ok` < warnAt ≤ `warning` < 100% ≤ `full`.
 * No limit (`null`/`undefined`) is unlimited; a limit of 0 is already used up.
 */
const getUsageState = (used: number, limit?: number | null, warnAt = 0.8) => {
    if (limit === null || limit === undefined) return 'ok' as const;
    if (limit <= 0) return 'full' as const;
    const ratio = used / limit;
    if (ratio >= 1) return 'full' as const;
    if (ratio >= warnAt) return 'warning' as const;
    return 'ok' as const;
};

/**
 * The one usage meter (sessions, recording links, seats): d100 track, green → amber → red
 * fill, tabular figures.
 */
const UsageMeter = ({
    used,
    limit,
    unit,
    label,
    warnAt = 0.8,
    size = 'md',
    hideValue = false,
    className
}: UsageMeterProps) => {
    const state = getUsageState(used, limit, warnAt);
    const hasLimit = limit !== null && limit !== undefined;
    const pct = !hasLimit ? 0 : limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 100;
    const valueText = hasLimit
        ? `${used.toLocaleString()} of ${limit.toLocaleString()}${unit ? ` ${unit}` : ''}`
        : `${used.toLocaleString()}${unit ? ` ${unit}` : ''} · Unlimited`;

    return (
        <div className={cn('flex flex-col gap-1.5', className)}>
            {(label || !hideValue) && (
                <div className="flex items-center justify-between gap-2 text-xs">
                    {label && <span className="font-medium text-foreground">{label}</span>}
                    {!hideValue && (
                        <span
                            className={cn(
                                'tabular-nums',
                                state === 'full'
                                    ? 'text-danger'
                                    : state === 'warning'
                                      ? 'text-warning'
                                      : 'text-muted-foreground'
                            )}>
                            {valueText}
                        </span>
                    )}
                </div>
            )}
            {hasLimit ? (
                <div
                    role="meter"
                    aria-valuemin={0}
                    aria-valuemax={Math.max(limit, 0)}
                    aria-valuenow={Math.max(0, Math.min(used, limit))}
                    aria-valuetext={valueText}
                    aria-label={typeof label === 'string' ? label : (unit ?? 'Usage')}
                    className={cn(
                        'w-full overflow-hidden rounded-full bg-d100',
                        size === 'sm' ? 'h-1' : 'h-1.5'
                    )}>
                    <div
                        className={cn(
                            'h-full rounded-full transition-[width] duration-slow ease-out',
                            state === 'full'
                                ? 'bg-destructive'
                                : state === 'warning'
                                  ? 'bg-label-amber'
                                  : 'bg-primary'
                        )}
                        style={{ width: `${pct}%` }}
                    />
                </div>
            ) : null}
        </div>
    );
};

export { UsageMeter, getUsageState };
export type { UsageMeterProps };
