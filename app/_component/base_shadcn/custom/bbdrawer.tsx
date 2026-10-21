'use client';

import * as React from 'react';
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger
} from '../drawer';
import { cn } from '@lib/utils';

export type BbDrawerProps = React.ComponentProps<typeof Drawer> & {
    title?: React.ReactNode;
    description?: React.ReactNode;
    /** Footer content (primary / secondary actions). */
    footer?: React.ReactNode;
    /** Trigger node, wrapped in `DrawerTrigger asChild`. */
    trigger?: React.ReactNode;
    children: React.ReactNode;
    contentClassName?: string;
    headerClassName?: string;
    titleClassName?: string;
    descriptionClassName?: string;
    footerClassName?: string;
    triggerClassName?: string;
};

/**
 * Self-contained drawer (bottom sheet on mobile by default) with optional header, footer and
 * trigger. Card surface + modal shadow come from the primitive.
 */
export const BbDrawer = ({
    title,
    description,
    footer,
    trigger,
    children,
    contentClassName,
    headerClassName,
    titleClassName,
    descriptionClassName,
    footerClassName,
    triggerClassName,
    ...drawerProps
}: BbDrawerProps) => (
    <Drawer {...drawerProps}>
        {trigger ? (
            <DrawerTrigger className={triggerClassName} asChild>
                {trigger}
            </DrawerTrigger>
        ) : null}

        <DrawerContent className={contentClassName}>
            {(title || description) && (
                <DrawerHeader className={headerClassName}>
                    {title ? <DrawerTitle className={titleClassName}>{title}</DrawerTitle> : null}
                    {description ? (
                        <DrawerDescription className={descriptionClassName}>
                            {description}
                        </DrawerDescription>
                    ) : null}
                </DrawerHeader>
            )}

            {children}

            {footer ? <DrawerFooter className={cn(footerClassName)}>{footer}</DrawerFooter> : null}
        </DrawerContent>
    </Drawer>
);

BbDrawer.displayName = 'BbDrawer';

export { Drawer };
