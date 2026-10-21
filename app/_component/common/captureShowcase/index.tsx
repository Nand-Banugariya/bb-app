'use client';

import * as React from 'react';
import { motion } from '@components/common/authCard/authMotion';
import {
    AutoAwesomeIcon,
    ScreenRecordIcon,
    SendIcon,
    TerminalIcon,
    type IconProps
} from '@components/icons/material';
import { useMediaQuery } from '@hooks/use-mobile';
import { cn } from '@lib/utils';

const VIDEO_SRC = '/videos/bug-capture.mp4';
const POSTER_SRC = '/videos/bug-capture-poster.jpg';

/** Story stages (copy from the Login v2 design) and where each plays in the 9.6s video (s). */
const STAGES: {
    id: string;
    start: number;
    end: number;
    label: string;
    Icon: React.ComponentType<IconProps>;
    title: string;
    description: string;
}[] = [
    {
        id: 'capture',
        start: 0,
        end: 4.4,
        label: 'Capture',
        Icon: ScreenRecordIcon,
        title: 'Capture any bug in one click',
        description:
            'Screenshots, screen recordings and instant replays of the last two minutes, straight from your browser.'
    },
    {
        id: 'logs',
        start: 4.4,
        end: 5.8,
        label: 'Logs',
        Icon: TerminalIcon,
        title: 'Every log, attached automatically',
        description:
            'Console, network requests, user actions and device info travel with each report.'
    },
    {
        id: 'ai',
        start: 5.8,
        end: 7.6,
        label: 'AI',
        Icon: AutoAwesomeIcon,
        title: 'AI writes the repro steps',
        description: 'A clear summary and steps to reproduce, generated from the session.'
    },
    {
        id: 'ship',
        start: 7.6,
        end: Infinity,
        label: 'Ship',
        Icon: SendIcon,
        title: 'Straight to your tracker',
        description: 'Push the report to Jira, Linear, GitHub and more with one click.'
    }
];

const stageAt = (time: number) => {
    const i = STAGES.findIndex((s) => time >= s.start && time < s.end);
    return i === -1 ? 0 : i;
};

/**
 * Follows the video's playback position: the current stage as state (4 changes per loop) and
 * each bar's fill written straight to the DOM every frame, so the panel doesn't re-render 60×/s.
 */
function useVideoStage(
    videoRef: React.RefObject<HTMLVideoElement | null>,
    fillRefs: React.RefObject<(HTMLSpanElement | null)[]>,
    enabled: boolean
) {
    const [stage, setStage] = React.useState(0);

    React.useEffect(() => {
        const video = videoRef.current;
        if (!video || !enabled) return;
        let frame = 0;
        const tick = () => {
            const time = video.currentTime;
            const duration = Number.isFinite(video.duration) ? video.duration : 9.6;
            const index = stageAt(time);
            fillRefs.current?.forEach((fill, i) => {
                if (!fill) return;
                const s = STAGES[i];
                const end = Math.min(s.end, duration);
                const progress = i < index ? 1 : i > index ? 0 : (time - s.start) / (end - s.start);
                fill.style.width = `${Math.min(Math.max(progress, 0), 1) * 100}%`;
            });
            setStage((current) => (current === index ? current : index));
            frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [videoRef, fillRefs, enabled]);

    return stage;
}

type CaptureShowcaseProps = { className?: string };

/**
 * Login v2 right panel: the product video over a dot grid and drifting brand glow (it stays
 * still on hover), and the Capture → Logs → AI → Ship story underneath. Bars and
 * captions follow the video's playback; clicking a stage jumps the video there. Reduced
 * motion: no autoplay (poster frame), story rests on the first stage.
 */
function CaptureShowcase({ className }: CaptureShowcaseProps) {
    const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const fillRefs = React.useRef<(HTMLSpanElement | null)[]>([]);
    const stageIndex = useVideoStage(videoRef, fillRefs, !reducedMotion);

    const goToStage = (index: number) => {
        const video = videoRef.current;
        if (!video) return;
        video.currentTime = STAGES[index].start;
        if (video.paused && !reducedMotion) void video.play();
    };

    return (
        <div className={cn('relative flex size-full flex-col justify-center py-10', className)}>
            {/* Dot grid and two slowly drifting brand blobs. */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(color-mix(in_oklab,var(--fg)_7%,transparent)_1px,transparent_1px)] bg-[length:1.375rem_1.375rem] [mask-image:radial-gradient(ellipse_at_50%_40%,#000_25%,transparent_75%)]"
            />
            <div
                aria-hidden
                className="pointer-events-none absolute top-[14%] left-[18%] size-[22.5rem] rounded-full bg-[radial-gradient(closest-side,rgba(0,218,146,.22),transparent)] blur-[10px]"
                style={{ animation: motion.blob(14) }}
            />
            <div
                aria-hidden
                className="pointer-events-none absolute top-[40%] right-[6%] size-[16.25rem] rounded-full bg-[radial-gradient(closest-side,rgba(0,218,146,.12),transparent)] blur-[10px]"
                style={{ animation: motion.blob(18, -6) }}
            />

            <div className="relative mx-auto flex w-full max-w-[45rem] flex-col gap-8 px-16 max-lg:px-10">
                <div className="-mb-12 dark:mb-0" style={{ animation: motion.up(0.2, 0.9) }}>
                    <video
                        ref={videoRef}
                        src={VIDEO_SRC}
                        poster={POSTER_SRC}
                        autoPlay={!reducedMotion}
                        loop
                        muted
                        playsInline
                        preload="auto"
                        aria-label="BetterBugs captures a failed checkout with its console errors, network request and AI steps to reproduce, then sends it to Jira."
                        className={cn(
                            // The video frame has empty margins around its scene; 118% makes the scene the design's size.
                            '-mx-[9%] max-h-[60dvh] w-[118%] max-w-none object-contain',
                            // Light: the video's backdrop (#F5F5F5) matches the panel, so only a
                            // 2% edge fade is needed. Dark: it can't blend, so it's a framed card.
                            '[mask-composite:intersect] [mask-image:linear-gradient(to_right,transparent,black_2%,black_98%,transparent),linear-gradient(to_bottom,transparent,black_2%,black_98%,transparent)]',
                            'dark:mx-0 dark:w-full dark:rounded-[0.875rem] dark:shadow-[0_40px_80px_-30px_rgba(0,0,0,.55)] dark:[mask-image:none]'
                        )}
                    />
                </div>

                <div className="flex flex-col gap-3.5">
                    <div
                        className="grid grid-cols-4 gap-2"
                        role="tablist"
                        aria-label="How BetterBugs works">
                        {STAGES.map((s, i) => {
                            const isActive = i === stageIndex;
                            return (
                                <button
                                    key={s.id}
                                    type="button"
                                    role="tab"
                                    aria-selected={isActive}
                                    onClick={() => goToStage(i)}
                                    className="flex cursor-pointer flex-col gap-2 rounded-sm text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring">
                                    <span className="block h-[3px] w-full overflow-hidden rounded-full bg-border">
                                        <span
                                            ref={(el) => {
                                                fillRefs.current[i] = el;
                                            }}
                                            className="block h-full rounded-full bg-primary"
                                            style={{ width: 0 }}
                                        />
                                    </span>
                                    <span
                                        className={cn(
                                            'flex items-center gap-1.5 text-xs font-medium transition-colors duration-300',
                                            isActive ? 'text-foreground' : 'text-muted-foreground'
                                        )}>
                                        <s.Icon className="size-3.5" />
                                        {s.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* All captions stacked in one cell; the active one crossfades in. */}
                    <div className="grid min-h-[4.125rem]" aria-live="polite">
                        {STAGES.map((s, i) => (
                            <div
                                key={s.id}
                                aria-hidden={i !== stageIndex}
                                className={cn(
                                    'pointer-events-none flex flex-col gap-1 [grid-area:1/1]',
                                    'transition-[opacity,transform,filter] duration-[450ms] ease-[cubic-bezier(.16,1,.3,1)]',
                                    i === stageIndex
                                        ? 'translate-y-0 opacity-100 blur-none'
                                        : i < stageIndex
                                          ? '-translate-y-2.5 opacity-0 blur-[4px]'
                                          : 'translate-y-2.5 opacity-0 blur-[4px]'
                                )}>
                                <h2 className="text-xl font-semibold tracking-[-0.015em]">
                                    {s.title}
                                </h2>
                                <p className="text-md text-pretty text-muted-foreground">
                                    {s.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export { CaptureShowcase };
export type { CaptureShowcaseProps };
