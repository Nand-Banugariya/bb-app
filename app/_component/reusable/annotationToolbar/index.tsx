'use client';

import * as React from 'react';
import {
    ArrowOutwardIcon,
    ArrowSelectorToolIcon,
    BlurOnIcon,
    CropSquareIcon,
    DrawIcon,
    TitleIcon,
    type IconProps
} from '@components/icons/material';
import { Toggle } from '@components/base_shadcn/toggle';
import { BBTooltip } from '@components/base_shadcn/custom/bbtooltip';
import { cn } from '@lib/utils';

/**
 * Design system v2 · Screenshot editor toolbar: a glass bar (radius 8, menu shadow, 3px padding)
 * of 32px tools, the active one solid primary. Annotation colours are the label colours and are
 * the same in both themes; the selected swatch gets a 2px gap and a 2px ring in its colour.
 */
type AnnotationTool = 'select' | 'arrow' | 'rectangle' | 'pen' | 'text' | 'blur';

const TOOLS: { id: AnnotationTool; label: string; Icon: React.ComponentType<IconProps> }[] = [
    { id: 'select', label: 'Select', Icon: ArrowSelectorToolIcon },
    { id: 'arrow', label: 'Arrow', Icon: ArrowOutwardIcon },
    { id: 'rectangle', label: 'Rectangle', Icon: CropSquareIcon },
    { id: 'pen', label: 'Pen', Icon: DrawIcon },
    { id: 'text', label: 'Text', Icon: TitleIcon },
    { id: 'blur', label: 'Blur', Icon: BlurOnIcon }
];

const ANNOTATION_COLORS = [
    { name: 'Green', value: 'var(--label-green)' },
    { name: 'Amber', value: 'var(--label-amber)' },
    { name: 'Purple', value: 'var(--label-purple)' },
    { name: 'Pink', value: 'var(--label-pink)' },
    { name: 'Blue', value: 'var(--label-blue)' },
    { name: 'Gray', value: 'var(--label-gray)' },
    { name: 'Ink', value: 'var(--label-ink)' }
] as const;

interface AnnotationToolbarProps extends Omit<React.ComponentProps<'div'>, 'onChange'> {
    tool: AnnotationTool;
    onToolChange: (tool: AnnotationTool) => void;
    /** Subset/order of tools to show. */
    tools?: AnnotationTool[];
    /** Optional keyboard shortcut per tool, shown in the tooltip (e.g. { arrow: ['A'] }). */
    shortcuts?: Partial<Record<AnnotationTool, string[]>>;
}

function AnnotationToolbar({
    tool,
    onToolChange,
    tools,
    shortcuts,
    className,
    ...props
}: AnnotationToolbarProps) {
    const visible = tools ? TOOLS.filter((t) => tools.includes(t.id)) : TOOLS;
    return (
        <div
            role="toolbar"
            aria-label="Annotation tools"
            data-slot="annotation-toolbar"
            className={cn(
                'inline-flex items-center gap-0.5 rounded-lg bg-glass p-[3px] shadow-sh-lg backdrop-blur-sm',
                className
            )}
            {...props}>
            {visible.map(({ id, label, Icon }) => (
                <BBTooltip key={id} content={label} shortcut={shortcuts?.[id]} side="bottom">
                    <Toggle
                        variant="primary"
                        aria-label={label}
                        pressed={tool === id}
                        onPressedChange={() => onToolChange(id)}>
                        <Icon />
                    </Toggle>
                </BBTooltip>
            ))}
        </div>
    );
}

interface AnnotationColorPickerProps extends Omit<React.ComponentProps<'div'>, 'onChange'> {
    value: string;
    onChange: (color: string) => void;
}

/** Row of 28px colour swatches for pens, arrows and shapes. */
function AnnotationColorPicker({
    value,
    onChange,
    className,
    ...props
}: AnnotationColorPickerProps) {
    return (
        <div
            role="radiogroup"
            aria-label="Annotation colour"
            className={cn('flex flex-wrap gap-2', className)}
            {...props}>
            {ANNOTATION_COLORS.map((color) => {
                const selected = value === color.value;
                return (
                    <button
                        key={color.name}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        aria-label={color.name}
                        title={color.name}
                        onClick={() => onChange(color.value)}
                        className="relative size-7 cursor-pointer rounded-full outline-none hit-area focus-visible:ring-[3px] focus-visible:ring-ring"
                        style={{
                            background: color.value,
                            boxShadow: selected
                                ? `0 0 0 2px var(--card), 0 0 0 4px ${color.value}`
                                : '0 0 0 1px var(--d200)'
                        }}
                    />
                );
            })}
        </div>
    );
}

export { AnnotationToolbar, AnnotationColorPicker, ANNOTATION_COLORS };
export type { AnnotationToolbarProps, AnnotationColorPickerProps, AnnotationTool };
