import * as React from 'react';
import { ExpandMoreIcon } from '@components/icons/material';
import { cn } from '@lib/utils';

/**
 * Design system v2 · Property rows (session details: Status, Priority, Assignee).
 * A 110px muted label column with a 16px icon, then a 36px value button that tints d100 on
 * hover and ends in expand_more. Wrap the value in a Popover/DropdownMenu trigger to edit it.
 * Group rows in `PropertyRows` (sidebar surface, 16px padding, 1px ring).
 */
interface PropertyRowProps extends Omit<React.ComponentProps<'button'>, 'value'> {
    label: React.ReactNode;
    /** Icon before the label. */
    labelIcon?: React.ReactNode;
    /** Icon before the value (coloured by the value, e.g. a status or priority icon). */
    valueIcon?: React.ReactNode;
    value: React.ReactNode;
    /** Hides the chevron and hover state for read-only rows. */
    readOnly?: boolean;
}

const PropertyRow = React.forwardRef<HTMLButtonElement, PropertyRowProps>(function PropertyRow(
    { label, labelIcon, valueIcon, value, readOnly = false, className, ...props },
    ref
) {
    return (
        <div
            data-slot="property-row"
            className="grid min-h-10 grid-cols-[6.875rem_minmax(0,1fr)] items-center gap-2">
            <span className="flex min-w-0 items-center gap-2 text-md text-muted-foreground [&>svg]:size-4 [&>svg]:shrink-0">
                {labelIcon}
                <span className="truncate">{label}</span>
            </span>
            <button
                ref={ref}
                type="button"
                disabled={readOnly}
                className={cn(
                    'flex min-h-9 min-w-0 items-center gap-2 rounded-md py-1 pr-2 pl-2.5 text-left text-md text-foreground outline-none',
                    'transition-colors duration-fast focus-visible:ring-[3px] focus-visible:ring-ring',
                    readOnly ? 'cursor-default' : 'cursor-pointer hover:bg-d100',
                    '[&_svg]:shrink-0 [&>svg:first-child]:size-4',
                    className
                )}
                {...props}>
                {valueIcon}
                <span className="min-w-0 flex-1 truncate">{value}</span>
                {!readOnly && <ExpandMoreIcon className="size-[1.125rem] text-muted-foreground" />}
            </button>
        </div>
    );
});

interface PropertyRowsProps extends Omit<React.ComponentProps<'div'>, 'title'> {
    title?: React.ReactNode;
}

function PropertyRows({ title, className, children, ...props }: PropertyRowsProps) {
    return (
        <div
            data-slot="property-rows"
            className={cn('flex flex-col gap-1 rounded-lg bg-side p-4 shadow-sh', className)}
            {...props}>
            {title && (
                <span className="px-0.5 pb-1.5 text-xs font-medium text-muted-foreground">
                    {title}
                </span>
            )}
            {children}
        </div>
    );
}

export { PropertyRow, PropertyRows };
export type { PropertyRowProps, PropertyRowsProps };
