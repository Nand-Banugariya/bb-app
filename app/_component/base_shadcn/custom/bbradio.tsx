'use client';

import * as React from 'react';
import { RadioGroup, RadioGroupItem } from '../radio-group';
import { cn } from '@lib/utils';

const SPACING = { sm: 'gap-2', md: 'gap-3', lg: 'gap-4' } as const;

interface BbRadioGroupProps extends React.ComponentProps<typeof RadioGroup> {
    orientation?: 'horizontal' | 'vertical';
    spacing?: keyof typeof SPACING;
}

function BbRadioGroup({
    className,
    orientation = 'vertical',
    spacing = 'md',
    ...props
}: BbRadioGroupProps) {
    return (
        <RadioGroup
            orientation={orientation}
            className={cn(
                'flex',
                orientation === 'horizontal' ? 'flex-row flex-wrap' : 'flex-col',
                SPACING[spacing],
                className
            )}
            {...props}
        />
    );
}

type BbRadioItemProps = React.ComponentProps<typeof RadioGroupItem> & { value: string };

/** Same radio as `RadioGroupItem` (kept as the Bb* entry point). */
function BbRadioItem(props: BbRadioItemProps) {
    return <RadioGroupItem {...props} />;
}

interface BbRadioLabelProps extends React.ComponentProps<'label'> {
    required?: boolean;
}

function BbRadioLabel({ children, className, required = false, ...props }: BbRadioLabelProps) {
    return (
        <label
            className={cn(
                'cursor-pointer text-md leading-none text-foreground',
                // The radio before it carries `peer`.
                'peer-disabled:cursor-not-allowed peer-disabled:opacity-60',
                className
            )}
            {...props}>
            {children}
            {required && (
                <span aria-hidden className="ml-0.5 text-danger">
                    *
                </span>
            )}
        </label>
    );
}

interface BbRadioItemWithLabelProps {
    children: React.ReactNode;
    className?: string;
    radioId?: string;
    radioProps?: Omit<BbRadioItemProps, 'id' | 'value'>;
    labelProps?: Omit<BbRadioLabelProps, 'htmlFor' | 'children'>;
    required?: boolean;
    value: string;
}

/** Radio + label row, 10px apart. */
function BbRadioItemWithLabel({
    children,
    className,
    radioId,
    radioProps,
    labelProps,
    required = false,
    value
}: BbRadioItemWithLabelProps) {
    const autoId = React.useId();
    const id = radioId || autoId;

    return (
        <div
            className={cn(
                'flex items-center gap-2.5',
                radioProps?.disabled && 'cursor-not-allowed',
                className
            )}>
            <BbRadioItem id={id} value={value} required={required} {...radioProps} />
            <BbRadioLabel
                htmlFor={id}
                required={required}
                {...labelProps}
                className={cn(
                    radioProps?.disabled && 'cursor-not-allowed text-muted-foreground',
                    labelProps?.className
                )}>
                {children}
            </BbRadioLabel>
        </div>
    );
}

export { BbRadioGroup, BbRadioItem, BbRadioLabel, BbRadioItemWithLabel };
export type { BbRadioGroupProps, BbRadioItemProps, BbRadioLabelProps, BbRadioItemWithLabelProps };
