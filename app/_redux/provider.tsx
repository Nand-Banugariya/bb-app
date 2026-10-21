'use client';
import { ReactNode, useState } from 'react';
import { Provider } from 'react-redux';
import { createStore } from './store';
import type { RootState } from './reducers';

interface ReduxProviderProps {
    children: ReactNode;
    preloadedState?: Partial<RootState>;
}

/**
 * App-wide Redux store. Created once per provider instance (bb-app re-created it on every
 * render, which would throw away all state whenever the root re-rendered).
 */
export function ReduxProvider({ children, preloadedState }: ReduxProviderProps) {
    const [store] = useState(() => createStore(preloadedState));
    return <Provider store={store}>{children}</Provider>;
}
