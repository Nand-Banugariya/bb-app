'use client';

import * as React from 'react';
import {
    BBDialog,
    BBDialogContent,
    BBDialogDescription,
    BBDialogHeader,
    BBDialogTitle
} from '@components/base_shadcn/custom/bbdialog';
import { Kbd, KbdGroup } from '@components/base_shadcn/kbd';
import { formatKey, useHotkeys } from '@lib/customHooks/useHotkeys';

export { formatKey };

export interface ShortcutItem {
    /** Keys as typed, e.g. `['mod', 'K']`, `['J']`, `['Shift', '?']`. */
    keys: string[];
    description: string;
}

export interface ShortcutGroup {
    id: string;
    title: string;
    shortcuts: ShortcutItem[];
}

// Module-level registry so any screen can add its shortcuts to the `?` sheet
// while it's mounted (session list, video player, annotation editor …).
type Listener = () => void;
const groups = new Map<string, ShortcutGroup>();
const listeners = new Set<Listener>();
let snapshot: ShortcutGroup[] = [];
const emit = () => {
    snapshot = Array.from(groups.values());
    listeners.forEach((l) => l());
};

/** Show `group` in the `?` sheet while the calling component is mounted. */
export const useRegisterShortcuts = (group: ShortcutGroup) => {
    const key = JSON.stringify(group);
    React.useEffect(() => {
        const parsed = JSON.parse(key) as ShortcutGroup;
        groups.set(parsed.id, parsed);
        emit();
        return () => {
            groups.delete(parsed.id);
            emit();
        };
    }, [key]);
};

const subscribe = (l: Listener) => {
    listeners.add(l);
    return () => {
        listeners.delete(l);
    };
};

/** Inline shortcut hint for tooltips and menus: <ShortcutKeys keys={['mod','Z']} />. */
export const ShortcutKeys = ({ keys, className }: { keys: string[]; className?: string }) => (
    <KbdGroup className={className}>
        {keys.map((key, i) => (
            <Kbd key={i}>{formatKey(key)}</Kbd>
        ))}
    </KbdGroup>
);

/**
 * The `?` cheat sheet. Mount once per page shell; screens add their own
 * groups with `useRegisterShortcuts`. `general` lists the shell's own
 * shortcuts (search, sidebar) above them.
 */
export const KeyboardShortcutsDialog = ({ general = [] }: { general?: ShortcutItem[] }) => {
    const [open, setOpen] = React.useState(false);
    const registered = React.useSyncExternalStore(
        subscribe,
        () => snapshot,
        () => snapshot
    );
    const all: ShortcutGroup[] = [
        {
            id: 'general',
            title: 'General',
            shortcuts: [...general, { keys: ['?'], description: 'Show keyboard shortcuts' }]
        },
        ...registered.filter((group) => group.shortcuts.length > 0)
    ];

    useHotkeys({ '?': () => setOpen((v) => !v) });

    return (
        <BBDialog open={open} onOpenChange={setOpen}>
            <BBDialogContent size="lg">
                <BBDialogHeader>
                    <BBDialogTitle>Keyboard shortcuts</BBDialogTitle>
                    <BBDialogDescription>
                        Shortcuts don’t fire while you’re typing in a field.
                    </BBDialogDescription>
                </BBDialogHeader>
                {/* Flowing columns, not a grid: each group starts right under the
                    one before it, whatever the length of the group beside it. */}
                <div className="gap-x-8 sm:columns-2">
                    {all.map((group) => (
                        <section
                            key={group.id}
                            aria-label={group.title}
                            className="mb-4 flex break-inside-avoid flex-col gap-1">
                            <h3 className="text-overline">{group.title}</h3>
                            <ul className="flex flex-col">
                                {group.shortcuts.map((s) => (
                                    <li
                                        key={`${s.keys.join('+')} ${s.description}`}
                                        className="flex min-h-8 items-center justify-between gap-4 text-sm">
                                        <span className="text-foreground">{s.description}</span>
                                        <ShortcutKeys keys={s.keys} />
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ))}
                </div>
            </BBDialogContent>
        </BBDialog>
    );
};
