'use client';

import * as React from 'react';
import Link from 'next/link';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
    useSidebar
} from '../sidebar';
import { cn } from '@lib/utils';

interface BBSidebarProps extends Omit<React.ComponentProps<typeof Sidebar>, 'children'> {
    children: React.ReactNode;
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** Width of the collapsed icon rail. Design system: 64px. */
    iconWidth?: string;
    /** Kept for bb-app compatibility (the gap element is styled by the primitive). */
    gapClassName?: string;
    /** Classes for the SidebarProvider wrapper (e.g. h-full inside a sized container). */
    providerClassName?: string;
}

interface BBSidebarGroupProps extends Omit<React.ComponentProps<typeof SidebarGroup>, 'children'> {
    children: React.ReactNode;
    label?: string;
    /** Makes the label a link (preferred for navigation: keeps ⌘-click / open in new tab). */
    labelHref?: string;
    /** Makes the label a button. */
    onLabelClick?: (e: React.MouseEvent) => void;
    isActive?: boolean;
}

interface BBSidebarMenuItemProps extends Omit<React.HTMLAttributes<HTMLLIElement>, 'onClick'> {
    children: React.ReactNode;
    isActive?: boolean;
    tooltip?: string;
    onClick?: (e: React.MouseEvent) => void;
    /**
     * Render the row as its single child (e.g. a `<Link>`) instead of a <button>, so a navigation
     * row is a real link with one tab stop.
     */
    asChild?: boolean;
}

/**
 * Self-contained sidebar (provider + sidebar). Design system v2: 240px on Desktop, 64px icon rail
 * on Tablet (automatic), drawer on Mobile. Use `useBBSidebar()` inside for state/toggle.
 */
function BBSidebar({
    children,
    className,
    side = 'left',
    variant = 'sidebar',
    collapsible = 'offcanvas',
    defaultOpen = true,
    open,
    onOpenChange,
    iconWidth = '4rem',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    gapClassName,
    providerClassName,
    ...props
}: BBSidebarProps) {
    return (
        <SidebarProvider
            defaultOpen={defaultOpen}
            open={open}
            onOpenChange={onOpenChange}
            className={cn('min-h-0', providerClassName)}
            style={{ '--sidebar-width-icon': iconWidth } as React.CSSProperties}>
            <Sidebar
                side={side}
                variant={variant}
                collapsible={collapsible}
                className={className}
                {...props}>
                {children}
            </Sidebar>
        </SidebarProvider>
    );
}
BBSidebar.displayName = 'BBSidebar';

const BBSidebarHeader = ({ className, ...props }: React.ComponentProps<typeof SidebarHeader>) => (
    <SidebarHeader className={cn('border-b border-sidebar-border', className)} {...props} />
);
BBSidebarHeader.displayName = 'BBSidebarHeader';

const BBSidebarContent = (props: React.ComponentProps<typeof SidebarContent>) => (
    <SidebarContent {...props} />
);
BBSidebarContent.displayName = 'BBSidebarContent';

const BBSidebarFooter = ({ className, ...props }: React.ComponentProps<typeof SidebarFooter>) => (
    <SidebarFooter className={cn('border-t border-sidebar-border', className)} {...props} />
);
BBSidebarFooter.displayName = 'BBSidebarFooter';

function BBSidebarGroup({
    children,
    label,
    className,
    labelHref,
    onLabelClick,
    isActive,
    ...props
}: BBSidebarGroupProps) {
    // Same padding in every state so the label never shifts when it becomes active.
    const labelClassName = cn(
        'my-1 h-8 w-full px-2 text-sm font-semibold normal-case tracking-normal text-sidebar-foreground',
        (labelHref || onLabelClick) &&
            'cursor-pointer rounded-md text-left transition-colors duration-fast hover:bg-sel',
        isActive && 'bg-sel'
    );
    return (
        <SidebarGroup className={cn('p-0', className)} {...props}>
            {label &&
                (labelHref ? (
                    <SidebarGroupLabel asChild className={labelClassName}>
                        <Link
                            href={labelHref}
                            aria-current={isActive ? 'page' : undefined}
                            onClick={onLabelClick}>
                            {label}
                        </Link>
                    </SidebarGroupLabel>
                ) : onLabelClick ? (
                    <SidebarGroupLabel asChild className={labelClassName}>
                        <button
                            type="button"
                            aria-current={isActive ? 'page' : undefined}
                            onClick={onLabelClick}>
                            {label}
                        </button>
                    </SidebarGroupLabel>
                ) : (
                    <SidebarGroupLabel className={labelClassName}>{label}</SidebarGroupLabel>
                ))}
            <SidebarGroupContent>{children}</SidebarGroupContent>
        </SidebarGroup>
    );
}
BBSidebarGroup.displayName = 'BBSidebarGroup';

const BBSidebarMenu = ({ className, ...props }: React.ComponentProps<typeof SidebarMenu>) => (
    <SidebarMenu className={cn('gap-0.5', className)} {...props} />
);
BBSidebarMenu.displayName = 'BBSidebarMenu';

/** Nav row: 36px, muted text, `sel` background + 500 weight when active, press dip on click. */
function BBSidebarMenuItem({
    children,
    isActive = false,
    tooltip,
    onClick,
    className,
    asChild = false,
    ...props
}: BBSidebarMenuItemProps) {
    return (
        <SidebarMenuItem {...props}>
            <SidebarMenuButton
                asChild={asChild}
                isActive={isActive}
                tooltip={tooltip}
                onClick={onClick}
                className={cn(
                    'transition-[background-color,color,transform] duration-fast ease-out active:scale-[0.98] motion-reduce:active:scale-100',
                    className
                )}>
                {children}
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}
BBSidebarMenuItem.displayName = 'BBSidebarMenuItem';

const BBSidebarTrigger = (props: React.ComponentProps<typeof SidebarTrigger>) => (
    <SidebarTrigger {...props} />
);
BBSidebarTrigger.displayName = 'BBSidebarTrigger';

const useBBSidebar = () => useSidebar();

export {
    BBSidebar,
    BBSidebarHeader,
    BBSidebarContent,
    BBSidebarFooter,
    BBSidebarGroup,
    BBSidebarMenu,
    BBSidebarMenuItem,
    BBSidebarTrigger,
    useBBSidebar
};

export type { BBSidebarProps, BBSidebarGroupProps, BBSidebarMenuItemProps };
