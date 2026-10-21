import * as React from 'react';
import { Card } from '@components/base_shadcn/card';
import { cn } from '@lib/utils';

/**
 * Design system v2 · Stat card (dashboard): 13px muted label with an 18px icon on the right,
 * a 28px tabular number, and an optional 12/500 delta line. Lay them out with `grid-cards`.
 */
interface StatCardProps extends Omit<React.ComponentProps<typeof Card>, 'children'> {
    label: React.ReactNode;
    value: React.ReactNode;
    icon?: React.ReactNode;
    /** e.g. "+14 this week". */
    delta?: React.ReactNode;
    /** Colour of the delta line. */
    trend?: 'up' | 'down' | 'neutral';
}

function StatCard({ label, value, icon, delta, trend = 'up', className, ...props }: StatCardProps) {
    return (
        <Card className={cn('gap-2 px-5', className)} {...props}>
            <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
                <span className="truncate">{label}</span>
                {icon && (
                    <span aria-hidden className="text-success [&>svg]:size-[1.125rem]">
                        {icon}
                    </span>
                )}
            </div>
            <div className="text-2xl font-semibold tracking-tighter tabular-nums">{value}</div>
            {delta && (
                <div
                    className={cn(
                        'text-xs font-medium',
                        trend === 'up' && 'text-success',
                        trend === 'down' && 'text-danger',
                        trend === 'neutral' && 'text-muted-foreground'
                    )}>
                    {delta}
                </div>
            )}
        </Card>
    );
}

export { StatCard };
export type { StatCardProps };
