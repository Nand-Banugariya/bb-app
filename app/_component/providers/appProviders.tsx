'use client';

import type { ReactNode } from 'react';
import { CookiesProvider } from 'react-cookie';
import { ReduxProvider } from '@redux/provider';
import { AuthSessionProvider } from './authSessionProvider';

/**
 * App-wide client state, mounted once in app/layout.tsx:
 * Redux store → react-cookie (`useCookies` needs a provider in v8) → session handling.
 */
function AppProviders({ children }: { children: ReactNode }) {
    return (
        <ReduxProvider>
            <CookiesProvider defaultSetOptions={{ path: '/' }}>
                <AuthSessionProvider>{children}</AuthSessionProvider>
            </CookiesProvider>
        </ReduxProvider>
    );
}

export { AppProviders };
