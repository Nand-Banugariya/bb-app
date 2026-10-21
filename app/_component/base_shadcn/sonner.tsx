'use client';

import { CheckCircleIcon, ErrorIcon, InfoIcon, WarningIcon } from '@components/icons/material';
import { Toaster as Sonner, type ToasterProps } from 'sonner';
import { Spinner } from './spinner';

/**
 * Design system v2 · Toast: inverted in both themes (foreground surface, background text),
 * 44px, radius 8, modal shadow, 18px status icon, action in primary green.
 */
const Toaster = ({ ...props }: ToasterProps) => {
    return (
        <Sonner
            className="toaster group"
            position="bottom-right"
            icons={{
                success: <CheckCircleIcon className="size-[1.125rem] text-primary" />,
                info: <InfoIcon className="size-[1.125rem]" />,
                warning: <WarningIcon className="size-[1.125rem] text-label-amber" />,
                error: <ErrorIcon className="size-[1.125rem] text-label-pink" />,
                loading: <Spinner />
            }}
            toastOptions={{
                classNames: {
                    toast: 'min-h-11 gap-2.5 !rounded-lg !border-0 !py-2.5 !pr-3 !pl-3.5 !text-md !shadow-modal',
                    title: '!font-normal',
                    description: '!text-sm !opacity-70',
                    actionButton:
                        '!bg-transparent !px-0 !text-sm !font-medium !text-primary hover:!underline',
                    cancelButton: '!bg-transparent !px-0 !text-sm !font-medium !text-background/70'
                }
            }}
            style={
                {
                    '--normal-bg': 'var(--fg)',
                    '--normal-text': 'var(--bg)',
                    '--normal-border': 'transparent',
                    '--border-radius': 'var(--radius-lg)'
                } as React.CSSProperties
            }
            {...props}
        />
    );
};

export { Toaster };
