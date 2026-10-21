'use client';

import * as React from 'react';
import Link from 'next/link';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger
} from '../dropdown-menu';
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from '../drawer';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';
import { Spinner } from '../spinner';
import { BbPopconfirm } from './bbpopconfirm';
import { CheckIcon, DeleteIcon } from '@components/icons/material';
import { useIsMobile } from '@hooks/use-mobile';
import { cn } from '@lib/utils';

export interface BBDropdownItem {
    id: string;
    label: React.ReactNode;
    icon?: React.ReactNode;
    shortcut?: string;
    disabled?: boolean;
    onClick?: () => void;
    /** 'custom' renders `label` as-is (a row that brings its own menu items). */
    type?: 'item' | 'checkbox' | 'radio' | 'separator' | 'label' | 'delete' | 'link' | 'custom';
    checked?: boolean;
    value?: string;
    inset?: boolean;
    deleteConfirmation?: {
        title?: React.ReactNode;
        description?: React.ReactNode;
        /** Confirm button label; defaults to "Delete". */
        okText?: string;
        cancelText?: string;
        onCancel?: () => void;
    };
    href?: string;
    target?: '_blank' | '_self' | '_parent' | '_top';
    className?: string;
}

export interface BBDropdownProps {
    loading?: boolean;
    trigger: React.ReactNode;
    items?: BBDropdownItem[];
    footer?: BBDropdownItem[];
    /** Custom menu content (DropdownMenu* parts). Always renders as a menu, also on mobile. */
    children?: React.ReactNode;
    className?: string;
    contentClassName?: string;
    align?: 'start' | 'center' | 'end';
    side?: 'top' | 'right' | 'bottom' | 'left';
    sideOffset?: number;
    alignOffset?: number;
    /** Gap Radix keeps between the menu and the viewport edges. */
    collisionPadding?: React.ComponentProps<typeof DropdownMenuContent>['collisionPadding'];
    onOpenChange?: (open: boolean) => void;
    defaultOpen?: boolean;
    open?: boolean;
    modal?: boolean;
    dir?: 'ltr' | 'rtl';
    onSelect?: (item: BBDropdownItem) => void;
    onCheckedChange?: (item: BBDropdownItem, checked: boolean) => void;
    onValueChange?: (value: string) => void;
    value?: string;
    defaultValue?: string;
    name?: string;
    required?: boolean;
    disabled?: boolean;
    /**
     * Render `children` in a popover (a bottom sheet on mobile) instead of a menu. Use it for
     * panels of fields (filter checklists, forms): a menu swallows Tab, so inputs inside it
     * can't be reached from the keyboard.
     */
    asPanel?: boolean;
    /** Accessible title of the mobile bottom sheet. */
    sheetTitle?: string;
}

/** Design-system menu rule: destructive items come last, after a divider. */
function withDeleteDivider(items: BBDropdownItem[]): BBDropdownItem[] {
    const out: BBDropdownItem[] = [];
    items.forEach((item, i) => {
        const prev = out[out.length - 1];
        if (item.type === 'delete' && i > 0 && prev?.type !== 'separator') {
            out.push({ id: `${item.id}-divider`, label: null, type: 'separator' });
        }
        out.push(item);
    });
    return out;
}

const ItemIcon = ({ icon }: { icon?: React.ReactNode }) =>
    icon ? <span className="flex shrink-0 items-center [&_svg]:size-4">{icon}</span> : null;

/**
 * Data-driven menu (bb-app API). Responsive per design system v2: below 640px the same items
 * open in a bottom sheet with 44px rows; from Tablet up it's a dropdown menu.
 */
function BBDropdown({
    loading = false,
    trigger,
    items = [],
    footer,
    children,
    className,
    contentClassName,
    align = 'end',
    side = 'bottom',
    sideOffset = 4,
    alignOffset = 0,
    collisionPadding,
    onOpenChange,
    defaultOpen = false,
    open,
    modal = false,
    dir,
    onSelect,
    onCheckedChange,
    onValueChange,
    value,
    defaultValue,
    disabled = false,
    asPanel = false,
    sheetTitle = 'Menu'
}: BBDropdownProps) {
    const isMobile = useIsMobile();
    const [internalValue, setInternalValue] = React.useState(defaultValue || '');
    const currentValue = value !== undefined ? value : internalValue;

    // Track open state when uncontrolled so selection can force-close the menu (link items
    // navigate client-side and would otherwise leave it open).
    const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
    const isOpen = open !== undefined ? open : internalOpen;

    const handleOpenChange = (nextOpen: boolean) => {
        if (open === undefined) setInternalOpen(nextOpen);
        onOpenChange?.(nextOpen);
    };
    const closeMenu = () => handleOpenChange(false);

    const handleValueChange = (newValue: string) => {
        if (value === undefined) setInternalValue(newValue);
        onValueChange?.(newValue);
    };

    const handleItemClick = (item: BBDropdownItem) => {
        if (item.disabled || item.type === 'delete') return;
        if (item.type === 'checkbox') onCheckedChange?.(item, !item.checked);
        else if (item.type === 'radio') handleValueChange(item.value || item.id);
        onSelect?.(item);
        item.onClick?.();
        // Checkbox/radio items stay open for multi-select; everything else dismisses.
        if (item.type !== 'checkbox' && item.type !== 'radio') closeMenu();
    };

    const mainItems = withDeleteDivider(items);
    const footerItems = footer ? withDeleteDivider(footer) : [];
    const hasRadio = [...mainItems, ...footerItems].some((item) => item.type === 'radio');

    const loadingNode = (
        <div className="flex w-full items-center justify-center py-5">
            <Spinner className="size-5 text-primary" />
        </div>
    );

    // ---------- Mobile: bottom sheet ----------
    if (isMobile && !children) {
        const rowClass =
            'flex h-11 w-full cursor-pointer items-center gap-3 rounded-md px-3 text-left text-md text-foreground outline-none hover:bg-d100 focus-visible:bg-d100 active:bg-d100 disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-5 [&_svg]:shrink-0';

        const renderSheetItem = (item: BBDropdownItem) => {
            const isChecked =
                item.type === 'checkbox'
                    ? item.checked
                    : item.type === 'radio'
                      ? currentValue === (item.value || item.id)
                      : false;
            const content = (
                <>
                    {item.icon && (
                        <span
                            className={cn(
                                'flex',
                                item.type === 'delete' ? 'text-danger' : 'text-muted-foreground'
                            )}>
                            {item.icon}
                        </span>
                    )}
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    {isChecked && <CheckIcon className="text-success" />}
                </>
            );

            switch (item.type) {
                case 'separator':
                    return (
                        <div key={item.id} role="separator" className="-mx-2 my-1 h-px bg-d200" />
                    );
                case 'custom':
                    return <React.Fragment key={item.id}>{item.label}</React.Fragment>;
                case 'label':
                    return (
                        <div
                            key={item.id}
                            className={cn(
                                'flex items-center gap-2 px-3 pt-2 pb-1 text-overline',
                                item.className
                            )}>
                            <ItemIcon icon={item.icon} />
                            {item.label}
                        </div>
                    );
                case 'delete':
                    return (
                        <BbPopconfirm
                            key={item.id}
                            title={item.deleteConfirmation?.title}
                            description={item.deleteConfirmation?.description}
                            icon={<DeleteIcon />}
                            okText={item.deleteConfirmation?.okText ?? 'Delete'}
                            cancelText={item.deleteConfirmation?.cancelText}
                            onCancel={item.deleteConfirmation?.onCancel}
                            variant="destructive"
                            onConfirm={() => {
                                item.onClick?.();
                                closeMenu();
                            }}>
                            <button
                                type="button"
                                disabled={item.disabled}
                                className={cn(
                                    rowClass,
                                    'text-danger hover:bg-danger-subtle',
                                    item.className
                                )}>
                                {content}
                            </button>
                        </BbPopconfirm>
                    );
                case 'link': {
                    const href = item.href || '';
                    const isInternal = href.startsWith('/') && item.target !== '_blank';
                    const linkProps = {
                        className: cn(
                            rowClass,
                            item.disabled && 'pointer-events-none opacity-50',
                            item.className
                        ),
                        onClick: () => handleItemClick(item),
                        target: item.target || '_self'
                    };
                    return isInternal ? (
                        <Link key={item.id} href={href} {...linkProps}>
                            {content}
                        </Link>
                    ) : (
                        <a
                            key={item.id}
                            href={href}
                            rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
                            {...linkProps}>
                            {content}
                        </a>
                    );
                }
                default:
                    return (
                        <button
                            key={item.id}
                            type="button"
                            role={
                                item.type === 'checkbox'
                                    ? 'menuitemcheckbox'
                                    : item.type === 'radio'
                                      ? 'menuitemradio'
                                      : 'menuitem'
                            }
                            aria-checked={
                                item.type === 'checkbox' || item.type === 'radio'
                                    ? !!isChecked
                                    : undefined
                            }
                            disabled={item.disabled}
                            onClick={() => handleItemClick(item)}
                            className={cn(
                                rowClass,
                                item.inset && 'pl-11',
                                item.className,
                                className
                            )}>
                            {content}
                        </button>
                    );
            }
        };

        return (
            <Drawer open={isOpen} onOpenChange={handleOpenChange}>
                <DrawerTrigger asChild disabled={disabled}>
                    {trigger}
                </DrawerTrigger>
                <DrawerContent className={contentClassName}>
                    <DrawerTitle className="sr-only">{sheetTitle}</DrawerTitle>
                    <div className="flex max-h-[70vh] flex-col overflow-y-auto p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
                        {loading
                            ? loadingNode
                            : asPanel
                              ? children
                              : [
                                    ...mainItems.map(renderSheetItem),
                                    ...(footerItems.length
                                        ? [
                                              <div
                                                  key="__footer-divider"
                                                  role="separator"
                                                  className="-mx-2 my-1 h-px bg-d200"
                                              />,
                                              ...footerItems.map(renderSheetItem)
                                          ]
                                        : [])
                                ]}
                    </div>
                </DrawerContent>
            </Drawer>
        );
    }

    // ---------- Tablet and up: popover panel ----------
    if (asPanel) {
        return (
            <Popover open={isOpen} onOpenChange={handleOpenChange} modal={modal}>
                <PopoverTrigger asChild disabled={disabled}>
                    {trigger}
                </PopoverTrigger>
                <PopoverContent
                    className={cn('w-auto p-0', contentClassName)}
                    align={align}
                    side={side}
                    sideOffset={sideOffset}
                    alignOffset={alignOffset}
                    collisionPadding={collisionPadding}>
                    {loading ? loadingNode : children}
                </PopoverContent>
            </Popover>
        );
    }

    // ---------- Tablet and up: dropdown menu ----------
    const renderItem = (item: BBDropdownItem) => {
        const commonProps = {
            disabled: item.disabled,
            onClick: () => handleItemClick(item),
            className: cn(
                item.inset && 'pl-8',
                !item.disabled && 'cursor-pointer',
                item.className,
                className
            )
        };
        const inner = (
            <>
                <ItemIcon icon={item.icon} />
                {item.label}
                {item.shortcut && <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut>}
            </>
        );

        switch (item.type) {
            case 'separator':
                return <DropdownMenuSeparator key={item.id} />;
            case 'custom':
                return <React.Fragment key={item.id}>{item.label}</React.Fragment>;
            case 'label':
                return (
                    <DropdownMenuLabel
                        key={item.id}
                        inset={item.inset}
                        className={cn('flex items-center gap-2', className, item.className)}>
                        <ItemIcon icon={item.icon} />
                        {item.label}
                    </DropdownMenuLabel>
                );
            case 'checkbox':
                return (
                    <DropdownMenuCheckboxItem
                        key={item.id}
                        {...commonProps}
                        checked={item.checked}
                        onCheckedChange={(checked: boolean) => onCheckedChange?.(item, checked)}>
                        {inner}
                    </DropdownMenuCheckboxItem>
                );
            case 'radio':
                return (
                    <DropdownMenuRadioItem
                        key={item.id}
                        {...commonProps}
                        value={item.value || item.id}>
                        {inner}
                    </DropdownMenuRadioItem>
                );
            case 'delete':
                return (
                    <BbPopconfirm
                        key={item.id}
                        title={item.deleteConfirmation?.title}
                        description={item.deleteConfirmation?.description}
                        icon={<DeleteIcon />}
                        okText={item.deleteConfirmation?.okText ?? 'Delete'}
                        cancelText={item.deleteConfirmation?.cancelText}
                        onCancel={item.deleteConfirmation?.onCancel}
                        variant="destructive"
                        onConfirm={() => item.onClick?.()}>
                        <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                            variant="destructive"
                            {...commonProps}>
                            {inner}
                        </DropdownMenuItem>
                    </BbPopconfirm>
                );
            case 'link': {
                // Internal routes navigate client-side via next/link; external URLs stay a plain
                // anchor. `asChild` makes the anchor the menu item, so Enter follows the link.
                const href = item.href || '';
                const isInternal = href.startsWith('/') && item.target !== '_blank';
                return (
                    <DropdownMenuItem key={item.id} asChild {...commonProps}>
                        {isInternal ? (
                            <Link href={href} target={item.target || '_self'}>
                                {inner}
                            </Link>
                        ) : (
                            <a
                                href={href}
                                target={item.target || '_self'}
                                rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}>
                                {inner}
                            </a>
                        )}
                    </DropdownMenuItem>
                );
            }
            default:
                return (
                    <DropdownMenuItem key={item.id} {...commonProps}>
                        {inner}
                    </DropdownMenuItem>
                );
        }
    };

    const list = (entries: BBDropdownItem[]) =>
        hasRadio ? (
            <DropdownMenuRadioGroup value={currentValue} onValueChange={handleValueChange}>
                {entries.map(renderItem)}
            </DropdownMenuRadioGroup>
        ) : (
            entries.map(renderItem)
        );

    return (
        <DropdownMenu onOpenChange={handleOpenChange} open={isOpen} modal={modal} dir={dir}>
            <DropdownMenuTrigger asChild disabled={disabled}>
                {trigger}
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className={cn(footerItems.length > 0 && 'flex flex-col p-0', contentClassName)}
                align={align}
                side={side}
                sideOffset={sideOffset}
                alignOffset={alignOffset}
                collisionPadding={collisionPadding}>
                {loading ? (
                    loadingNode
                ) : children ? (
                    children
                ) : footerItems.length > 0 ? (
                    <>
                        <div className="min-h-0 flex-1 overflow-y-auto p-1">{list(mainItems)}</div>
                        <div className="border-t border-d200 bg-popover p-1">
                            {list(footerItems)}
                        </div>
                    </>
                ) : (
                    list(mainItems)
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
BBDropdown.displayName = 'BBDropdown';

export {
    BBDropdown,
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger
};

export default BBDropdown;
