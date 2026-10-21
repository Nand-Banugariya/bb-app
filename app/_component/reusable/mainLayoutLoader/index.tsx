import React from 'react';
import { Skeleton } from '@components/base_shadcn/skeleton';

// Fallback for the page area inside the main layout's content card. The shell
// (top bar, sidebar, card) stays mounted around it, so this only fills the
// card — a neutral page header over a list, close to most pages it stands in
// for, so the swap to real content doesn't jump.
const MainLayoutLoader = () => (
    <div
        role="status"
        aria-label="Loading"
        aria-busy
        className="page-padding flex h-full w-full flex-col gap-6 py-6">
        <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton tone="subtle" className="h-3.5 w-72 max-w-full" />
            </div>
            <Skeleton className="h-9 w-28" />
        </div>
        <div className="flex flex-col overflow-hidden rounded-lg shadow-sh">
            {Array.from({ length: 6 }).map((_, index) => (
                <div
                    key={index}
                    className="flex h-[3.25rem] items-center gap-4 border-b border-d100 px-4 last:border-b-0">
                    <Skeleton className="size-4 rounded-sm" />
                    <Skeleton className="h-3 flex-1" />
                    <Skeleton tone="subtle" className="hidden h-3 w-24 sm:block" />
                    <Skeleton tone="subtle" className="h-3 w-16" />
                </div>
            ))}
        </div>
    </div>
);

export default MainLayoutLoader;
