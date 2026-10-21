'use client';

import { useEffect, useLayoutEffect, useRef, useSyncExternalStore } from 'react';

/** True when keystrokes should go to the focused element, not to shortcuts. */
export const isEditableTarget = (target: EventTarget | null): boolean => {
    const el = target as HTMLElement | null;
    if (!el || !(el instanceof HTMLElement)) return false;
    if (el.isContentEditable) return true;
    const tag = el.tagName;
    if (tag === 'TEXTAREA' || tag === 'SELECT') return true;
    if (tag === 'INPUT') {
        const type = (el as HTMLInputElement).type;
        return !['checkbox', 'radio', 'button', 'submit', 'reset', 'range', 'color'].includes(type);
    }
    return Boolean(
        el.closest('[contenteditable="true"], .ql-editor, .monaco-editor, [role="textbox"]')
    );
};

/**
 * An open modal (dialog, alert dialog) owns the keyboard. Dialogs matching
 * `allowed` (a selector) don't count.
 */
export const isModalOpen = (allowed?: string) =>
    typeof document !== 'undefined' &&
    Array.from(
        document.querySelectorAll(
            '[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"]'
        )
    ).some((dialog) => !allowed || !dialog.matches(allowed));

export const isMac = () =>
    typeof navigator !== 'undefined' &&
    /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent);

// ⌥ hints still show over this dialog: its nav has go-to keys (Settings).
const HINT_DIALOGS_SELECTOR = '[data-settings-dialog]';

/** Renders a key the way the user's platform labels it (⌘ on macOS, Ctrl elsewhere). */
export const formatKey = (key: string) => {
    const k = key.toLowerCase();
    if (k === 'mod') return isMac() ? '⌘' : 'Ctrl';
    if (k === 'shift') return isMac() ? '⇧' : 'Shift';
    if (k === 'alt') return isMac() ? '⌥' : 'Alt';
    if (k === 'enter') return '↵';
    if (k === 'escape' || k === 'esc') return 'Esc';
    if (k === 'backspace') return isMac() ? '⌫' : 'Backspace';
    if (k === 'arrowup') return '↑';
    if (k === 'arrowdown') return '↓';
    if (k === 'arrowleft') return '←';
    if (k === 'arrowright') return '→';
    if (k === 'space') return 'Space';
    return key.length === 1 ? key.toUpperCase() : key;
};

const MODIFIER_KEYS = new Set(['Shift', 'Control', 'Alt', 'AltGraph', 'Meta', 'CapsLock', 'Fn']);

const SYMBOL_CODES: Record<string, string> = {
    '[': 'BracketLeft',
    ']': 'BracketRight',
    ',': 'Comma',
    '.': 'Period',
    '/': 'Slash',
    ';': 'Semicolon',
    "'": 'Quote',
    '-': 'Minus',
    '=': 'Equal',
    '`': 'Backquote',
    '\\': 'Backslash'
};

/** The physical key (`KeyboardEvent.code`) that types `key` on a US layout. */
const codeForKey = (key: string) => {
    if (/^[a-z]$/i.test(key)) return `Key${key.toUpperCase()}`;
    if (/^[0-9]$/.test(key)) return `Digit${key}`;
    return SYMBOL_CODES[key];
};

/**
 * Matches one binding such as `'?'`, `'Escape'`, `'mod+k'`, `'mod+Enter'`,
 * `'shift+ArrowDown'`, `'alt+s'`. `mod` = ⌘ on macOS, Ctrl elsewhere;
 * `alt` = ⌥ on macOS.
 */
export const matchesHotkey = (e: KeyboardEvent, binding: string) => {
    const parts = binding.split('+');
    const key = parts.pop() as string;
    const mods = new Set(parts.map((p) => p.toLowerCase()));
    const wantMod = mods.has('mod');
    const wantMeta = mods.has('meta') || (wantMod && isMac());
    const wantCtrl = mods.has('ctrl') || (wantMod && !isMac());
    const wantAlt = mods.has('alt');
    const wantShift = mods.has('shift');

    if (e.metaKey !== wantMeta || e.ctrlKey !== wantCtrl || e.altKey !== wantAlt) return false;
    // Symbols like `?` are typed with Shift — don't require it to be listed.
    const isSymbol = key.length === 1 && !/[a-z0-9]/i.test(key);
    if (!isSymbol && e.shiftKey !== wantShift) return false;

    // On macOS ⌥ changes the character (⌥S types ß, ⌥[ types “) or starts an
    // accent (⌥E), so there the physical key decides. Elsewhere Alt leaves the
    // character alone, and matching it keeps non-US layouts right.
    if (wantAlt && key.length === 1 && !/^[\x21-\x7e]$/.test(e.key)) {
        return e.code === codeForKey(key);
    }

    const pressed = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    const wanted = key.length === 1 ? key.toLowerCase() : key;
    return pressed === wanted || (key === 'Space' && e.key === ' ');
};

// Shortcut hints on buttons: the ⌥/Alt shortcuts, while ⌥/Alt is held on its
// own. They wait a moment first, so typing ⌥S doesn't flash them, and any
// other key ends the peek until ⌥ is pressed again (stepping through a list
// with ⌥J doesn't bring them back).
const ALT_HINT_DELAY_MS = 250;
let altHint = false;
let altHintTimer: ReturnType<typeof setTimeout> | undefined;
const hintListeners = new Set<() => void>();
const emitHints = () => hintListeners.forEach((l) => l());

let altAlone = false;
const hideAltHint = () => {
    altAlone = false;
    clearTimeout(altHintTimer);
    if (altHint) {
        altHint = false;
        emitHints();
    }
};
const onHintKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Alt') {
        // Holding the key repeats keydown; only the first press counts.
        if (e.repeat) return;
        altAlone =
            !e.metaKey &&
            !e.ctrlKey &&
            !e.shiftKey &&
            !isEditableTarget(e.target) &&
            !isModalOpen(HINT_DIALOGS_SELECTOR);
        if (altAlone) {
            clearTimeout(altHintTimer);
            altHintTimer = setTimeout(() => {
                altHint = true;
                emitHints();
            }, ALT_HINT_DELAY_MS);
        }
        return;
    }
    // Any other key (⌥S itself) ends the peek.
    if (altAlone) hideAltHint();
};
const onHintKeyUp = (e: KeyboardEvent) => {
    if (e.key !== 'Alt') return;
    // Windows browsers move focus to their menu when Alt is released on its
    // own; after a peek at the hints, keep it on the page.
    if (altHint) e.preventDefault();
    hideAltHint();
};
let hintListenersInstalled = false;
const installHintListeners = () => {
    if (hintListenersInstalled || typeof window === 'undefined') return;
    hintListenersInstalled = true;
    window.addEventListener('keydown', onHintKeyDown, true);
    window.addEventListener('keyup', onHintKeyUp, true);
    window.addEventListener('blur', hideAltHint);
    window.addEventListener('pointerdown', hideAltHint, true);
};

/** Whether the ⌥/Alt hints are showing (⌥/Alt is held on its own). */
export const useKeyHint = () =>
    useSyncExternalStore(
        (l) => {
            installHintListeners();
            hintListeners.add(l);
            return () => hintListeners.delete(l);
        },
        () => altHint,
        () => false
    );

interface HotkeyOptions {
    enabled?: boolean;
    /** Fire even while typing in a field (default: only `mod+…` bindings do). */
    allowInInputs?: boolean;
    /** Keep working while a dialog is open (default false), or only while the dialogs open match this selector. */
    allowInDialogs?: boolean | string;
    preventDefault?: boolean;
    /**
     * Only when no other shortcut took the key: app-wide go-to keys that a
     * screen can reuse for its own action (⌥S: status on a session, Settings
     * elsewhere). Fallbacks listen on window, the rest on document, so the
     * screen's shortcut runs first and its preventDefault turns these off.
     */
    fallback?: boolean;
}

/**
 * Global keyboard shortcuts. Ignores keystrokes while typing (inputs, editors,
 * IME composition) and while a modal is open, so shortcuts never eat text.
 * A handler that returns `false` had nothing to act on: the key is left
 * alone, so a fallback shortcut on the same key can take it.
 * Register the same shortcuts with `useRegisterShortcuts` so they appear in
 * the `?` sheet.
 */
export const useHotkeys = (
    bindings: Record<string, (e: KeyboardEvent) => void | boolean>,
    {
        enabled = true,
        allowInInputs = false,
        allowInDialogs = false,
        preventDefault = true,
        fallback = false
    }: HotkeyOptions = {}
) => {
    // Latest bindings without re-subscribing; updated after render, not during it.
    const ref = useRef(bindings);
    useLayoutEffect(() => {
        ref.current = bindings;
    });

    useEffect(() => {
        if (!enabled) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.isComposing || MODIFIER_KEYS.has(e.key) || e.defaultPrevented) return;
            if (
                allowInDialogs !== true &&
                isModalOpen(typeof allowInDialogs === 'string' ? allowInDialogs : undefined)
            )
                return;
            for (const [binding, handler] of Object.entries(ref.current)) {
                if (!matchesHotkey(e, binding)) continue;
                const hasMod = /(^|\+)(mod|meta|ctrl)\+/i.test(binding);
                if (!allowInInputs && !hasMod && isEditableTarget(e.target)) return;
                if (handler(e) === false) return;
                if (preventDefault) e.preventDefault();
                return;
            }
        };
        const target: Window | Document = fallback ? window : document;
        target.addEventListener('keydown', onKeyDown as EventListener);
        return () => target.removeEventListener('keydown', onKeyDown as EventListener);
    }, [enabled, allowInInputs, allowInDialogs, preventDefault, fallback]);
};
