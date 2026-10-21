import * as React from 'react';
import { cn } from '@lib/utils';

interface SettingsSectionProps {
    title: React.ReactNode;
    description?: React.ReactNode;
    /** Controls in the section header (e.g. "Add", a switch). */
    actions?: React.ReactNode;
    children?: React.ReactNode;
    /** Buttons row at the bottom (Save / Cancel). */
    footer?: React.ReactNode;
    /** `danger` = red ring and title, for delete / transfer / leave. */
    variant?: 'default' | 'danger';
    headingLevel?: 'h2' | 'h3';
    id?: string;
    className?: string;
    bodyClassName?: string;
}

/**
 * A settings card (design system v2 · Card: 1px ring, 8px radius, 20px padding): title
 * (16px / 600), one-line description, body, optional footer. Every settings page is a stack
 * of these — don't hand-roll headings.
 */
const SettingsSection = ({
    title,
    description,
    actions,
    children,
    footer,
    variant = 'default',
    headingLevel: Heading = 'h2',
    id,
    className,
    bodyClassName
}: SettingsSectionProps) => {
    const autoId = React.useId();
    const headingId = `${id ?? autoId}-title`;
    return (
        <section
            id={id}
            aria-labelledby={headingId}
            className={cn(
                'rounded-lg bg-card text-card-foreground',
                variant === 'danger' ? 'shadow-error' : 'shadow-sh',
                className
            )}>
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 p-5">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <Heading
                        id={headingId}
                        className={cn(
                            'text-lg font-semibold tracking-tight',
                            variant === 'danger' ? 'text-danger' : 'text-foreground'
                        )}>
                        {title}
                    </Heading>
                    {description && <p className="text-sm text-muted-foreground">{description}</p>}
                </div>
                {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
            </div>
            {children && <div className={cn('px-5 pb-5', bodyClassName)}>{children}</div>}
            {footer && (
                <div className="flex flex-wrap items-center justify-end gap-2 rounded-b-lg border-t border-d200 bg-side px-5 py-3">
                    {footer}
                </div>
            )}
        </section>
    );
};

export { SettingsSection };
export type { SettingsSectionProps };
