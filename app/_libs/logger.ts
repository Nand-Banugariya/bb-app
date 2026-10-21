import { Environment } from './types';

/**
 * App logger with the same API as `console`. Logging is on outside production; flip it at
 * runtime from the devtools console with `setBetterBugsLogging(true)`. Set
 * `localStorage.debug = 'prefix*'` to only show lines whose first argument matches.
 * Works on both server and client (no 'use client').
 */
let enableLogging = process.env.NEXT_PUBLIC_ENV !== Environment.Production;

function setBetterBugsLogging(val: boolean) {
    enableLogging = val;
}

function getBetterBugsLogging() {
    return enableLogging;
}

const debugGlobals = globalThis as typeof globalThis & {
    setBetterBugsLogging?: typeof setBetterBugsLogging;
    getBetterBugsLogging?: typeof getBetterBugsLogging;
};
debugGlobals.setBetterBugsLogging = setBetterBugsLogging;
debugGlobals.getBetterBugsLogging = getBetterBugsLogging;

type Logger = Pick<
    Console,
    'log' | 'warn' | 'error' | 'info' | 'debug' | 'group' | 'groupCollapsed' | 'groupEnd'
> & {
    sample(type: 'warn' | 'info' | 'error', rate: number, ...args: unknown[]): void;
};

export const logger: Logger = {
    sample(type, rate, ...args) {
        if (Math.random() < rate && shouldLog(args)) console[type](...args);
    },
    log: (...args) => {
        if (shouldLog(args)) console.log(...args);
    },
    warn: (...args) => {
        if (shouldLog(args)) console.warn(...args);
    },
    error: (...args) => {
        if (shouldLog(args)) console.error(...args);
    },
    info: (...args) => {
        if (shouldLog(args)) console.info(...args);
    },
    debug: (...args) => {
        if (shouldLog(args)) console.debug(...args);
    },
    group: (...args) => {
        if (shouldLog(args)) console.group(...args);
    },
    groupCollapsed: (...args) => {
        if (shouldLog(args)) console.groupCollapsed(...args);
    },
    groupEnd: () => {
        if (enableLogging) console.groupEnd();
    }
};

function shouldLog(args: unknown[]): boolean {
    return enableLogging && exposeLog(args);
}

/**
 * Conditionally log lines based on simple pattern matching against `localStorage.debug`.
 * Returns true unless a pattern is set and the first argument doesn't match it.
 */
function exposeLog(args: unknown[]): boolean {
    let pattern: unknown;
    try {
        pattern = 'localStorage' in globalThis ? globalThis.localStorage.debug : undefined;
    } catch {
        // No access to localStorage (iframes, privacy settings): just log.
        return true;
    }
    if (typeof pattern !== 'string' || !pattern || typeof args[0] !== 'string') return true;
    return new RegExp('^' + pattern.replace('*', '.*')).test(args[0]);
}
