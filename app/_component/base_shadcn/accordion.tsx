'use client';

import * as React from 'react';
import { cn } from '@lib/utils';
import { ExpandMoreIcon } from '@components/icons/material';
import { Accordion as AccordionPrimitive } from 'radix-ui';

function Accordion({ ...props }: React.ComponentProps<typeof AccordionPrimitive.Root>) {
    return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

/** Design system v2 · Accordion: d200 dividers, 14/500 trigger, muted chevron, slow ease-out open. */
function AccordionItem({
    className,
    ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
    return (
        <AccordionPrimitive.Item
            data-slot="accordion-item"
            className={cn('border-b border-d200 last:border-b-0', className)}
            {...props}
        />
    );
}

function AccordionTrigger({
    className,
    children,
    ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
    return (
        <AccordionPrimitive.Header className="flex">
            <AccordionPrimitive.Trigger
                data-slot="accordion-trigger"
                className={cn(
                    'flex flex-1 cursor-pointer items-center justify-between gap-4 rounded-md py-3 text-left text-md font-medium transition-colors duration-fast outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180',
                    className
                )}
                {...props}>
                {children}
                <ExpandMoreIcon className="pointer-events-none size-[1.125rem] shrink-0 text-muted-foreground transition-transform duration-base ease-out" />
            </AccordionPrimitive.Trigger>
        </AccordionPrimitive.Header>
    );
}

function AccordionContent({
    className,
    children,
    ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
    return (
        <AccordionPrimitive.Content
            data-slot="accordion-content"
            className="overflow-hidden text-md text-muted-foreground data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
            {...props}>
            <div className={cn('pt-0 pb-3', className)}>{children}</div>
        </AccordionPrimitive.Content>
    );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
