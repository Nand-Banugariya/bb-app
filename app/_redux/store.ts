'use client';
import { configureStore } from '@reduxjs/toolkit';
import rootReducer, { type RootState } from './reducers';

export const createStore = (preloadedState?: Partial<RootState>) => {
    return configureStore({
        reducer: rootReducer,
        preloadedState
    });
};

export type AppStore = ReturnType<typeof createStore>;
export type AppDispatch = AppStore['dispatch'];
