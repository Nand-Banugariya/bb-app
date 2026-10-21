'use client';

import * as React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../accordion';
import { cn } from '@lib/utils';

/** Full-width accordion. Styling (dividers, 14/500 trigger, chevron) comes from the primitive. */
const BBAccordion = ({ className, ...props }: React.ComponentProps<typeof Accordion>) => (
    <Accordion className={cn('w-full', className)} {...props} />
);
BBAccordion.displayName = 'BBAccordion';

const BBAccordionItem = (props: React.ComponentProps<typeof AccordionItem>) => (
    <AccordionItem {...props} />
);
BBAccordionItem.displayName = 'BBAccordionItem';

const BBAccordionTrigger = (props: React.ComponentProps<typeof AccordionTrigger>) => (
    <AccordionTrigger {...props} />
);
BBAccordionTrigger.displayName = 'BBAccordionTrigger';

/** `className` lands on the inner padding wrapper; the height animation stays on the Radix element. */
const BBAccordionContent = (props: React.ComponentProps<typeof AccordionContent>) => (
    <AccordionContent {...props} />
);
BBAccordionContent.displayName = 'BBAccordionContent';

export { BBAccordion, BBAccordionItem, BBAccordionTrigger, BBAccordionContent };
