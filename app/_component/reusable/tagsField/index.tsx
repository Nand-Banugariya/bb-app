import * as React from 'react';
import { UnfoldMoreIcon } from '@components/icons/material';
import { TagChip } from '@components/reusable/tagChip';
import { cn } from '@lib/utils';

/**
 * Design system v2 · Tags field: a 44px+ field on the card surface that wraps to show every tag
 * (never "+3 more"), ending in unfold_more. Hover takes the menu shadow. It's the trigger —
 * wrap it in a Popover/Command to pick tags.
 */
interface TagsFieldProps extends React.ComponentProps<'button'> {
    tags: { label: string; color?: string; id?: string }[];
    placeholder?: React.ReactNode;
}

const TagsField = React.forwardRef<HTMLButtonElement, TagsFieldProps>(function TagsField(
    { tags, placeholder = 'Add tags', className, ...props },
    ref
) {
    return (
        <button
            ref={ref}
            type="button"
            data-slot="tags-field"
            className={cn(
                'flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-md bg-card py-2 pr-2.5 pl-3 text-left text-foreground shadow-sh outline-none',
                'transition-shadow duration-fast ease-out hover:shadow-sh-lg focus-visible:shadow-focus',
                'disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:shadow-error',
                className
            )}
            {...props}>
            <span className="flex min-w-0 flex-1 flex-wrap gap-1.5">
                {tags.length ? (
                    tags.map((tag) => (
                        <TagChip key={tag.id ?? tag.label} label={tag.label} color={tag.color} />
                    ))
                ) : (
                    <span className="text-md text-muted-foreground">{placeholder}</span>
                )}
            </span>
            <UnfoldMoreIcon className="size-[1.125rem] shrink-0 text-muted-foreground" />
        </button>
    );
});

export { TagsField };
export type { TagsFieldProps };
