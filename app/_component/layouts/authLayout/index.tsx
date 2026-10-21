'use client';

import * as React from 'react';
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { AuthMotionStyles, motion } from '@components/common/authCard/authMotion';
import { CaptureShowcase } from '@components/common/captureShowcase';
import { ThemeToggleButton } from '@components/common/themeSwitcher';
import WorkspaceOnboardingAnimation from '@components/common/workspaceOnboardingAnimation';
import BbMark from '@components/newIcons/bb-mark';
import EnvIcon from '@components/reusable/envIcon';

interface AuthLayoutProps {
    children: ReactNode;
    /** Right panel content; Login v2's capture showcase when left out. */
    aside?: ReactNode;
    /** `onboarding`: the same shell without the sign-up legal line. */
    variant?: 'login' | 'onboarding';
}

const LEGAL_LINK = 'font-medium text-foreground hover:underline underline-offset-[3px]';

/**
 * Sign-in / onboarding shell (Login v2): the step card on the left over a dot grid and brand
 * glow that follow the pointer; from Desktop (`md`) the showcase panel on the right (1 : 1.1).
 * Both halves are flush, square-edged and exactly fill the viewport (no page scroll); if the
 * form is taller than the window, only the left column scrolls. Below Desktop the left column
 * takes the full width. User onboarding uses the same shell with the `onboarding` variant.
 */
const AuthLayout = ({ children, aside, variant = 'login' }: AuthLayoutProps) => {
    const isOnboarding = variant === 'onboarding';
    const pathname = usePathname();
    const isWorkspaceOnboarding = pathname?.includes('/workspace/onboarding');
    const rootRef = React.useRef<HTMLDivElement>(null);
    const frame = React.useRef(0);

    // Spotlight position as CSS variables, written straight to the DOM (no re-renders).
    const onMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
        const el = rootRef.current;
        if (!el) return;
        const { clientX, clientY } = event;
        cancelAnimationFrame(frame.current);
        frame.current = requestAnimationFrame(() => {
            const box = el.getBoundingClientRect();
            el.style.setProperty('--sx', `${clientX - box.left}px`);
            el.style.setProperty('--sy', `${clientY - box.top}px`);
        });
    };

    return (
        <div className="grid h-dvh overflow-hidden bg-background text-md text-foreground md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <AuthMotionStyles />
            <div
                ref={rootRef}
                onMouseMove={onMouseMove}
                className="no-scrollbar relative flex h-dvh flex-col overflow-x-hidden overflow-y-auto px-8 py-6 max-sm:px-4">
                {/* Dot grid revealed around the pointer, and a soft brand glow following it. */}
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(color-mix(in_oklab,var(--fg)_7%,transparent)_1px,transparent_1px)] bg-[length:1.25rem_1.25rem] [mask-image:radial-gradient(22.5rem_circle_at_var(--sx,50%)_var(--sy,40%),#000,transparent_70%)]"
                />
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(26.25rem_circle_at_var(--sx,50%)_var(--sy,40%),rgba(0,218,146,.07),transparent_65%)]"
                />

                <header
                    className="relative flex items-center justify-between gap-3"
                    style={{ animation: motion.fade(0, 0.5) }}>
                    <span className="flex h-[1.875rem] items-center gap-2">
                        <BbMark aria-hidden className="size-7 shrink-0" />
                        <span className="text-xl font-bold tracking-[-0.025em]">BetterBugs</span>
                        <EnvIcon />
                    </span>
                    <ThemeToggleButton className="rounded-[0.625rem] text-foreground hover:bg-muted" />
                </header>

                <main className="relative flex flex-1 items-center justify-center py-6">
                    {children}
                </main>

                <footer
                    hidden={isOnboarding}
                    className="relative text-center text-sm leading-[1.6] text-balance text-muted-foreground"
                    style={{ animation: motion.fade(0.9) }}>
                    By signing up, you agree to BetterBugs,{' '}
                    <a
                        href="https://www.betterbugs.io/terms-of-service"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={LEGAL_LINK}>
                        Terms of Service
                    </a>{' '}
                    and{' '}
                    <a
                        href="https://www.betterbugs.io/privacy-policy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={LEGAL_LINK}>
                        Privacy Policy
                    </a>
                </footer>
            </div>

            <aside
                className="relative hidden h-dvh overflow-hidden border-l border-d200 bg-d100 md:flex dark:bg-side"
                style={{ animation: motion.fade(0, 0.8) }}>
                {aside ? (
                    aside
                ) : isWorkspaceOnboarding ? (
                    <div className="m-auto px-8">
                        <WorkspaceOnboardingAnimation />
                    </div>
                ) : (
                    <CaptureShowcase />
                )}
            </aside>
        </div>
    );
};

export default AuthLayout;
