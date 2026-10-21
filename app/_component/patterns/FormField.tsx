'use client';

import * as React from 'react';
import { InlineError } from './ErrorState';
import { cn } from '@lib/utils';

interface FormFieldProps {
    label?: React.ReactNode;
    /** Shown right of the label (e.g. "Optional", a help link). */
    labelRight?: React.ReactNode;
    hint?: React.ReactNode;
    /** Error message; marks the control invalid and is announced. */
    error?: React.ReactNode;
    required?: boolean;
    /** Id for the control; generated when omitted. */
    id?: string;
    className?: string;
    /**
     * One control element (it receives `id`, `aria-describedby` and
     * `aria-invalid`), or a render function for composite controls.
     */
    children:
        | React.ReactElement
        | ((field: {
              id: string;
              'aria-describedby'?: string;
              'aria-invalid'?: boolean;
          }) => React.ReactNode);
}

/**
 * Label + control + hint + error, wired for assistive tech (design system v2 · 05):
 * label 12/500 muted above, 6px gap, 12px hint or red error below.
 */
const FormField = ({
    label,
    labelRight,
    hint,
    error,
    required,
    id,
    className,
    children
}: FormFieldProps) => {
    const autoId = React.useId();
    const controlId = id ?? autoId;
    const hintId = `${controlId}-hint`;
    const errorId = `${controlId}-error`;
    const invalid = Boolean(error);
    const describedBy = error ? errorId : hint ? hintId : undefined;
    const fieldProps = {
        id: controlId,
        'aria-describedby': describedBy,
        'aria-invalid': invalid || undefined
    };

    let control: React.ReactNode;
    if (typeof children === 'function') {
        control = children(fieldProps);
    } else {
        const child = children as React.ReactElement<Record<string, unknown>>;
        control = React.cloneElement(child, {
            id: (child.props.id as string | undefined) ?? controlId,
            'aria-describedby':
                [child.props['aria-describedby'], describedBy].filter(Boolean).join(' ') ||
                undefined,
            'aria-invalid':
                (child.props['aria-invalid'] as boolean | undefined) ?? (invalid || undefined)
        });
    }

    return (
        <div className={cn('grid gap-1.5', className)}>
            {(label || labelRight) && (
                <div className="flex items-center justify-between gap-2 px-0.5">
                    {label && (
                        <label
                            htmlFor={controlId}
                            className="text-xs font-medium text-muted-foreground">
                            {label}
                            {required && (
                                <span aria-hidden className="ml-0.5 text-danger">
                                    *
                                </span>
                            )}
                        </label>
                    )}
                    {labelRight}
                </div>
            )}
            {control}
            {error ? (
                <InlineError id={errorId}>{error}</InlineError>
            ) : hint ? (
                <p id={hintId} className="text-xs text-muted-foreground">
                    {hint}
                </p>
            ) : null}
        </div>
    );
};

export { FormField };
export type { FormFieldProps };
