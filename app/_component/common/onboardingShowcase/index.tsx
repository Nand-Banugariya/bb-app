'use client';

import * as React from 'react';
import { motion } from '@components/common/authCard/authMotion';
import { useOnboardingContext, type OnboardingStep } from '@components/contexts/onboardingContext';
import { AutoAwesomeIcon, VideocamIcon, type IconProps } from '@components/icons/material';
import { useMediaQuery } from '@hooks/use-mobile';
import { cn } from '@lib/utils';

const VIDEO_SRC = '/videos/tools-orbit.mp4';
const POSTER_SRC = '/videos/tools-orbit-poster.jpg';

const CHIPS: { Icon: React.ComponentType<IconProps>; title: string; sub: string; float: string }[] =
    [
        {
            Icon: VideocamIcon,
            title: 'Screen + console logs',
            sub: 'captured in one click',
            float: motion.float(5)
        },
        {
            Icon: AutoAwesomeIcon,
            title: 'AI repro steps',
            sub: 'written for you',
            float: motion.float(6, -2)
        }
    ];

/** Caption under the orbit, per onboarding step (copy from the Onboarding v4 design). */
const CAPTIONS: Record<OnboardingStep, { title: string; description: string }> = {
    1: {
        title: 'Built around your team',
        description: 'Your role and team size shape the defaults for every bug report you file.'
    },
    2: {
        title: 'Reports land where you work',
        description:
            'Pick your tools and every report syncs with logs, screenshots and repro steps attached.'
    },
    3: {
        title: 'Ready to capture',
        description: 'Install the extension and record your first bug in one click.'
    }
};

/**
 * Onboarding v4 right panel: BetterBugs at the centre of an orbit of project-management tools
 * (the tools-orbit video), two floating feature chips, and a caption that follows the step.
 * Reduced motion: no autoplay (poster frame) and the chips stay still.
 */
function OnboardingShowcase({ className }: { className?: string }) {
    const { onboardingStep } = useOnboardingContext();
    const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
    const caption = CAPTIONS[onboardingStep];

    return (
        <div
            className={cn(
                'relative flex size-full flex-col items-center justify-center gap-7 p-10',
                className
            )}>
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(color-mix(in_oklab,var(--fg)_7%,transparent)_1px,transparent_1px)] bg-[length:1.375rem_1.375rem] [mask-image:radial-gradient(ellipse_at_50%_42%,#000_25%,transparent_75%)]"
            />

            <div
                className="relative aspect-square w-[min(26.25rem,100%)] shrink-0"
                style={{ animation: motion.up(0.2, 0.9) }}>
                <video
                    src={VIDEO_SRC}
                    poster={POSTER_SRC}
                    autoPlay={!reducedMotion}
                    loop
                    muted
                    playsInline
                    preload="auto"
                    aria-label="BetterBugs at the centre of Jira, ClickUp, Linear, Asana, Trello, GitHub, Notion and Azure Boards, connecting to each in turn."
                    className={cn(
                        'size-full object-contain',
                        // Light: the video's backdrop (#F4F4F4) is the panel's, so a soft edge fade
                        // is enough. Dark: it can't blend, so it's a framed card.
                        '[mask-composite:intersect] [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent),linear-gradient(to_bottom,transparent,black_4%,black_96%,transparent)]',
                        'dark:rounded-[1.5rem] dark:shadow-[0_40px_80px_-30px_rgba(0,0,0,.55)] dark:[mask-image:none]'
                    )}
                />
            </div>

            <div className="relative -mt-2 flex flex-wrap justify-center gap-3">
                {CHIPS.map(({ Icon, title, sub, float }) => (
                    <div key={title} style={{ animation: reducedMotion ? undefined : float }}>
                        <div className="flex items-center gap-2.5 rounded-[0.875rem] border border-border bg-card py-2.5 pr-3.5 pl-2.5 shadow-[0_18px_40px_-18px_rgba(0,0,0,.35)]">
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-[0.625rem] bg-spot text-foreground [&_svg]:size-[1.125rem]">
                                <Icon aria-hidden />
                            </span>
                            <span className="flex flex-col gap-px">
                                <span className="text-sm font-semibold whitespace-nowrap">
                                    {title}
                                </span>
                                <span className="font-mono text-2xs whitespace-nowrap text-muted-foreground">
                                    {sub}
                                </span>
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div
                key={onboardingStep}
                aria-live="polite"
                className="relative flex max-w-[26.25rem] flex-col items-center gap-1.5 text-center"
                style={{ animation: motion.up(0, 0.45) }}>
                <h2 className="text-xl font-semibold tracking-[-0.015em]">{caption.title}</h2>
                <p className="text-md text-pretty text-muted-foreground">{caption.description}</p>
            </div>
        </div>
    );
}

export { OnboardingShowcase };
