'use client';

import { Kbd } from '@components/base_shadcn/kbd';
import { formatKey, useKeyHint } from '@lib/customHooks/useHotkeys';
import { cn } from '@lib/utils';

/**
 * A button's ⌥ shortcut key, shown on it while ⌥/Alt is held (⌥S → "S").
 * Absolutely positioned inside a `relative` parent — on its top-right corner
 * unless `className` places it elsewhere.
 */
export const KeyHint = ({ keys, className }: { keys: string; className?: string }) => {
    const shown = useKeyHint();
    if (!shown) return null;
    return (
        <Kbd
            aria-hidden
            className={cn(
                'absolute -top-1.5 -right-1.5 z-20 bg-primary text-primary-foreground shadow-sh-lg motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95 motion-safe:duration-fast',
                className
            )}>
            {formatKey(keys)}
        </Kbd>
    );
};
