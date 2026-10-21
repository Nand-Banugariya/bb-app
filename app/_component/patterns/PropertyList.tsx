import * as React from 'react';
import { cn } from '@lib/utils';

/**
 * Property list (design system v2 · "Property rows · session details"): label on the left in a
 * fixed 110px column, value on the right, one 40px row per property (status, priority, …).
 */
const PropertyList = ({ className, ...props }: React.ComponentProps<'dl'>) => (
    <dl
        className={cn(
            'grid grid-cols-[6.875rem_minmax(0,1fr)] items-center gap-x-2 gap-y-0',
            className
        )}
        {...props}
    />
);

interface PropertyRowProps {
    label: React.ReactNode;
    children: React.ReactNode;
    /** Id for the value control, so the label can name it. */
    htmlFor?: string;
    className?: string;
}

const PropertyRow = ({ label, children, htmlFor, className }: PropertyRowProps) => (
    <>
        <dt
            className={cn(
                "flex min-h-10 items-center gap-2 text-md text-muted-foreground [&_svg:not([class*='size-'])]:size-4",
                className
            )}>
            {htmlFor ? <label htmlFor={htmlFor}>{label}</label> : label}
        </dt>
        <dd className={cn('flex min-h-10 min-w-0 items-center', className)}>{children}</dd>
    </>
);

export { PropertyList, PropertyRow };
export type { PropertyRowProps };
