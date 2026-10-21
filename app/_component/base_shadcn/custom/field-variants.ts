import { cva, type VariantProps } from 'class-variance-authority';

/**
 * The one field recipe (design system v2 · Forms). Select/Combobox/Date triggers, the tag input
 * and the multiselect build on it, so every field shares Input's look: 1px hairline ring,
 * radius 6, 14px text, green focus ring + glow, red ring when `aria-invalid="true"`, d100 fill
 * when disabled.
 *   sm 32 (filter bars) · default 36 (forms) · lg 44 (design "Dropdown field": card surface,
 *   lifts to the menu shadow on hover).
 */
export const fieldVariants = cva(
    [
        'flex w-full min-w-0 rounded-md bg-background text-md text-foreground shadow-hairline outline-none',
        'transition-[box-shadow,background-color] duration-fast ease-out',
        'placeholder:text-muted-foreground',
        'focus-visible:shadow-focus',
        'aria-invalid:shadow-error',
        'disabled:cursor-not-allowed disabled:bg-d100 disabled:text-muted-foreground'
    ],
    {
        variants: {
            size: {
                sm: 'h-8 px-2.5 text-sm',
                default: 'h-9 px-3',
                lg: 'h-11 bg-card px-3 font-medium shadow-sh hover:shadow-sh-lg'
            },
            multiline: {
                true: 'h-auto min-h-9 py-1',
                false: ''
            }
        },
        defaultVariants: {
            size: 'default',
            multiline: false
        }
    }
);

/** Open-state styling for triggers that open a popover/listbox (select, combobox, date). */
export const fieldOpenClasses = 'data-[state=open]:shadow-focus';

/** Field label: 12/500 muted, 6px above the control. */
export const fieldLabelClasses = 'px-0.5 text-xs font-medium text-muted-foreground';

export type FieldVariantProps = VariantProps<typeof fieldVariants>;
