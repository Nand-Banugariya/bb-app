import * as React from 'react';
import { cn } from '@lib/utils';
import { Card, CardContent, CardHeader } from '../card';

interface BBCardProps extends React.ComponentProps<typeof Card> {
    children: React.ReactNode;
    /** default / outlined: card surface + 1px ring · billing: recessed d100 surface. */
    variant?: 'default' | 'billing' | 'outlined';
}

/**
 * Design system v2 · Card (8px radius, 1px ring, no resting shadow). Unlike the primitive, the
 * BBCard frame has no padding of its own: BBCardHeader / Content / Footer pad themselves (20px),
 * matching bb-app. `interactive` (from Card) adds the hover lift.
 */
function BBCard({ className, variant = 'default', children, ...props }: BBCardProps) {
    return (
        <Card
            className={cn('gap-0 py-0', variant === 'billing' && 'bg-d100/40', className)}
            {...props}>
            {children}
        </Card>
    );
}
BBCard.displayName = 'BBCard';

function BBCardHeader({
    className,
    variant = 'default',
    ...props
}: React.ComponentProps<'div'> & { variant?: 'default' | 'billing' }) {
    return (
        <CardHeader
            className={cn(
                'flex flex-col gap-1.5',
                variant === 'default' ? 'p-5 pb-3' : 'p-0 pb-4',
                className
            )}
            {...props}
        />
    );
}
BBCardHeader.displayName = 'BBCardHeader';

function BBCardContent({
    className,
    variant = 'default',
    ...props
}: React.ComponentProps<'div'> & { variant?: 'default' | 'billing' }) {
    return (
        <CardContent
            className={cn(variant === 'default' ? 'p-5 pt-0' : 'p-0', className)}
            {...props}
        />
    );
}
BBCardContent.displayName = 'BBCardContent';

const BBCardTitle = ({ className, ...props }: React.ComponentProps<'div'>) => (
    <div
        className={cn('text-lg font-semibold tracking-tight text-foreground', className)}
        {...props}
    />
);
BBCardTitle.displayName = 'BBCardTitle';

const BBCardDescription = ({ className, ...props }: React.ComponentProps<'div'>) => (
    <div className={cn('text-sm text-muted-foreground', className)} {...props} />
);
BBCardDescription.displayName = 'BBCardDescription';

const BBCardFooter = ({ className, ...props }: React.ComponentProps<'div'>) => (
    <div className={cn('flex items-center p-5 pt-0', className)} {...props} />
);
BBCardFooter.displayName = 'BBCardFooter';

export { BBCard, BBCardHeader, BBCardContent, BBCardTitle, BBCardDescription, BBCardFooter };
