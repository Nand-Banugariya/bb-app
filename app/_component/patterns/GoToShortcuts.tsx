'use client';

import { useRouter } from 'next/navigation';
import { useRegisterShortcuts } from '@components/patterns/KeyboardShortcuts';
import { useHotkeys } from '@lib/customHooks/useHotkeys';

/**
 * Workspace pages ⌥ + a letter opens, under `/workspace/<id>/`. A screen's own
 * ⌥ shortcut on the same letter wins (they're fallbacks): on the session list
 * and session page ⌥S is status, ⌥M move or mute, ⌥P priority, ⌥I send to a
 * PM tool; everywhere else they open these pages. ⌥F is left to screens
 * (filters, full screen), so Feedbacks has no key.
 */
const GO_TO_PAGES = [
    { key: 'r', label: 'Recording links', path: 'recording-link' },
    { key: 's', label: 'Settings', path: 'settings/general' },
    { key: 'm', label: 'Members', path: 'settings/members' },
    { key: 'i', label: 'Integrations', path: 'settings/integrations' },
    { key: 'b', label: 'Plans & billing', path: 'settings/plans-usage' },
    { key: 'p', label: 'Profile', path: 'settings/profile' }
];

/** The key ⌥ + … uses for a workspace page (`'settings/members'` → `'m'`). */
export const goToKeyForPath = (path: string) => GO_TO_PAGES.find((page) => page.path === path)?.key;

// ⌥ + a go-to key also works with Settings open (it's a dialog), to move
// between its pages or leave it. The dialog carries this attribute.
const SETTINGS_DIALOG_SELECTOR = '[data-settings-dialog]';

/** ⌥ + a letter opens a workspace page (GO_TO_PAGES). Off without a workspace. */
export const useGoToShortcuts = ({ workspaceId }: { workspaceId?: string | null }) => {
    const router = useRouter();
    const base = `/workspace/${workspaceId}`;

    const bindings: Record<string, () => void> = {};
    GO_TO_PAGES.forEach(({ key, path }) => {
        bindings[`alt+${key}`] = () => router.push(`${base}/${path}`);
    });
    useHotkeys(bindings, {
        enabled: Boolean(workspaceId),
        allowInDialogs: SETTINGS_DIALOG_SELECTOR,
        fallback: true
    });

    useRegisterShortcuts({
        id: 'go-to',
        title: 'Go to',
        shortcuts: workspaceId
            ? GO_TO_PAGES.map(({ key, label }) => ({ keys: ['alt', key], description: label }))
            : []
    });
};
