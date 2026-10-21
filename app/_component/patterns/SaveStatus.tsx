import * as React from 'react';
import { cn } from '@lib/utils';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

/**
 * Inline autosave state for a settings card ("Saving…", "Saved"). Autosaved
 * fields don't toast on success; failures also toast with what to do.
 */
const SaveStatus = ({ state, className }: { state: SaveState; className?: string }) => (
    <span
        aria-live="polite"
        className={cn(
            'text-xs',
            state === 'error' ? 'text-danger' : 'text-muted-foreground',
            className
        )}>
        {state === 'saving'
            ? 'Saving…'
            : state === 'saved'
              ? 'Saved'
              : state === 'error'
                ? 'Couldn’t save'
                : ''}
    </span>
);

export { SaveStatus };
export type { SaveState };
