'use client';

import * as React from 'react';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '../dialog';
import { buttonVariants } from '../button';
import { cn } from '@lib/utils';

const DIALOG_SIZES = {
    sm: 'sm:max-w-[25rem]', // 400
    md: 'sm:max-w-[30rem]', // 480
    lg: 'sm:max-w-[40rem]', // 640
    xl: 'sm:max-w-[50rem]' // 800
} as const;

type BBDialogProps = React.ComponentProps<typeof Dialog>;

/**
 * Dialog content. Pick a width with `size` (sm 400 · md 480 · lg 640 · xl 800); on mobile it's
 * always full width minus 32px. Every Radix content prop passes through.
 */
type BBDialogContentProps = React.ComponentProps<typeof DialogContent> & {
    size?: keyof typeof DIALOG_SIZES;
};
type BBDialogHeaderProps = React.ComponentProps<'div'>;
type BBDialogTitleProps = React.ComponentProps<typeof DialogTitle>;
type BBDialogDescriptionProps = React.ComponentProps<typeof DialogDescription>;
type BBDialogFooterProps = React.ComponentProps<'div'>;
type BBDialogTriggerProps = React.ComponentProps<typeof DialogTrigger>;

const BBDialog = (props: BBDialogProps) => <Dialog {...props} />;
BBDialog.displayName = 'BBDialog';

const BBDialogContent = ({ size = 'md', className, ...props }: BBDialogContentProps) => (
    <DialogContent className={cn(DIALOG_SIZES[size], className)} {...props} />
);
BBDialogContent.displayName = 'BBDialogContent';

/** Header that leaves room for the top-right close button. */
const BBDialogHeader = ({ className, ...props }: BBDialogHeaderProps) => (
    <DialogHeader className={cn('pr-8', className)} {...props} />
);
BBDialogHeader.displayName = 'BBDialogHeader';

const BBDialogTitle = (props: BBDialogTitleProps) => <DialogTitle {...props} />;
BBDialogTitle.displayName = 'BBDialogTitle';

const BBDialogDescription = (props: BBDialogDescriptionProps) => <DialogDescription {...props} />;
BBDialogDescription.displayName = 'BBDialogDescription';

const BBDialogFooter = (props: BBDialogFooterProps) => <DialogFooter {...props} />;
BBDialogFooter.displayName = 'BBDialogFooter';

const BBDialogTrigger = (props: BBDialogTriggerProps) => <DialogTrigger {...props} />;
BBDialogTrigger.displayName = 'BBDialogTrigger';

/**
 * A close control with your own content and placement. BBDialogContent already renders the
 * top-right ×, so an empty `<BBDialogClose />` renders nothing.
 */
const BBDialogClose = ({
    children,
    className,
    ...props
}: React.ComponentProps<typeof DialogClose>) => {
    if (!children) return null;
    return (
        <DialogClose
            className={cn(buttonVariants({ variant: 'ghost', size: 'icon-md' }), className)}
            {...props}>
            {children}
        </DialogClose>
    );
};
BBDialogClose.displayName = 'BBDialogClose';

export {
    BBDialog,
    BBDialogContent,
    BBDialogHeader,
    BBDialogTitle,
    BBDialogDescription,
    BBDialogFooter,
    BBDialogTrigger,
    BBDialogClose
};

export type {
    BBDialogProps,
    BBDialogContentProps,
    BBDialogHeaderProps,
    BBDialogTitleProps,
    BBDialogDescriptionProps,
    BBDialogFooterProps,
    BBDialogTriggerProps
};
