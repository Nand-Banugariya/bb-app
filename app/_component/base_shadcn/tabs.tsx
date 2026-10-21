'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@lib/utils';
import { Tabs as TabsPrimitive } from 'radix-ui';

/**
 * Design system v2 · Tabs.
 *   default — segmented control: `seg` track with inset ring, 28px items, radius 4,
 *             active item on the card surface with a hairline shadow. (Session filters, theme switch.)
 *   line    — underline tabs: 36px, 14/500, 2px primary underline on the active tab. (Dev tools.)
 */
function Tabs({
    className,
    orientation = 'horizontal',
    ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
    return (
        <TabsPrimitive.Root
            data-slot="tabs"
            data-orientation={orientation}
            orientation={orientation}
            className={cn(
                'group/tabs flex gap-3 data-[orientation=horizontal]:flex-col',
                className
            )}
            {...props}
        />
    );
}

const tabsListVariants = cva(
    'group/tabs-list inline-flex w-fit items-center text-muted-foreground group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col',
    {
        variants: {
            variant: {
                default: 'gap-0.5 rounded-md bg-seg p-[3px] shadow-[inset_0_0_0_1px_var(--seg-bd)]',
                line: 'gap-4 bg-transparent shadow-[inset_0_-1px_0_var(--d200)]'
            }
        },
        defaultVariants: {
            variant: 'default'
        }
    }
);

function TabsList({
    className,
    variant = 'default',
    ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & VariantProps<typeof tabsListVariants>) {
    return (
        <TabsPrimitive.List
            data-slot="tabs-list"
            data-variant={variant}
            className={cn(tabsListVariants({ variant }), className)}
            {...props}
        />
    );
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
    return (
        <TabsPrimitive.Trigger
            data-slot="tabs-trigger"
            className={cn(
                "inline-flex cursor-pointer items-center justify-center gap-1.5 font-medium whitespace-nowrap text-muted-foreground outline-none transition-[color,background-color,box-shadow] duration-fast ease-out hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 aria-selected:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                'group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start',
                // segmented
                'group-data-[variant=default]/tabs-list:h-7 group-data-[variant=default]/tabs-list:rounded-sm group-data-[variant=default]/tabs-list:px-2.5 group-data-[variant=default]/tabs-list:text-sm',
                'group-data-[variant=default]/tabs-list:aria-selected:bg-card group-data-[variant=default]/tabs-list:aria-selected:shadow-[0_1px_2px_rgba(0,0,0,.08)]',
                // underline
                'group-data-[variant=line]/tabs-list:h-9 group-data-[variant=line]/tabs-list:border-b-2 group-data-[variant=line]/tabs-list:border-transparent group-data-[variant=line]/tabs-list:px-0.5 group-data-[variant=line]/tabs-list:text-md',
                'group-data-[variant=line]/tabs-list:aria-selected:border-primary',
                className
            )}
            {...props}
        />
    );
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
    return (
        <TabsPrimitive.Content
            data-slot="tabs-content"
            className={cn('flex-1 outline-none', className)}
            {...props}
        />
    );
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants };
