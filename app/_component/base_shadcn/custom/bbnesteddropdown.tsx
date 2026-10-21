'use client';

import * as React from 'react';
import { Button } from '../button';
import BBDropdown, { type BBDropdownItem } from './bbdropdown';
import { DeleteIcon, EditIcon, MoreVertIcon } from '@components/icons/material';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger
} from '../dropdown-menu';

interface MenuItemWithActionsProps {
    icon?: React.ReactNode;
    label: string;
    onClick: () => void;
    onEdit: () => void;
    onDelete: () => void;
    deleteConfirmation?: {
        title?: React.ReactNode;
        description?: React.ReactNode;
        okText?: string;
        cancelText?: string;
        onCancel?: () => void;
    };
    disabled?: boolean;
    /** Labels for the two actions (bb-app default: saved filter views). */
    editLabel?: string;
    deleteLabel?: string;
}

/**
 * A menu row (e.g. a saved view) with a ⋯ actions menu: Edit and Delete (with confirmation).
 * The ⋯ shows on row hover/focus, and always on touch screens. The actions menu is a BBDropdown,
 * so on mobile it opens as a bottom sheet.
 */
export function MenuItemWithActions({
    icon,
    label,
    onClick,
    onEdit,
    onDelete,
    deleteConfirmation,
    disabled = false,
    editLabel = 'Edit view',
    deleteLabel = 'Delete view'
}: MenuItemWithActionsProps) {
    const hasContent = icon || label;

    const items: BBDropdownItem[] = [
        { id: 'edit', label: editLabel, icon: <EditIcon />, onClick: onEdit },
        deleteConfirmation
            ? {
                  id: 'delete',
                  type: 'delete',
                  label: deleteLabel,
                  icon: <DeleteIcon />,
                  disabled,
                  onClick: onDelete,
                  deleteConfirmation: {
                      title: deleteConfirmation.title ?? deleteLabel,
                      description:
                          deleteConfirmation.description ??
                          'Are you sure you want to delete this filter view?',
                      okText: deleteConfirmation.okText || 'Delete',
                      cancelText: deleteConfirmation.cancelText || 'Cancel',
                      onCancel: deleteConfirmation.onCancel
                  }
              }
            : {
                  id: 'delete',
                  label: deleteLabel,
                  icon: <DeleteIcon />,
                  disabled,
                  onClick: onDelete,
                  className: 'text-danger focus:bg-danger-subtle focus:text-danger'
              }
    ];

    return (
        <div className="group relative flex items-center justify-end">
            {hasContent && (
                <button
                    type="button"
                    className="flex h-8 min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-md px-2 text-left text-sm transition-colors duration-fast hover:bg-d100 [&_svg]:size-4"
                    onClick={onClick}>
                    {icon && <span className="flex shrink-0 text-muted-foreground">{icon}</span>}
                    <span className="truncate">{label}</span>
                </button>
            )}

            <BBDropdown
                align="end"
                side="right"
                sheetTitle={label}
                items={items}
                trigger={
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Actions for ${label}`}
                        className="opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 focus-visible:opacity-100 touch:opacity-100 data-[state=open]:opacity-100"
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                        <MoreVertIcon />
                    </Button>
                }
            />
        </div>
    );
}

export {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger
};
