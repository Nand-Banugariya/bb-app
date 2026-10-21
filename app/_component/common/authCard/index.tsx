import * as React from 'react';
import { cn } from '@lib/utils';
import { motion } from './authMotion';

const CORNERS = [
    {
        pos: 'top-0 left-0 border-t-2 border-l-2 rounded-tl-[1.125rem]',
        anim: 'bb-c-tl',
        delay: 0.15
    },
    {
        pos: 'top-0 right-0 border-t-2 border-r-2 rounded-tr-[1.125rem]',
        anim: 'bb-c-tr',
        delay: 0.2
    },
    {
        pos: 'bottom-0 left-0 border-b-2 border-l-2 rounded-bl-[1.125rem]',
        anim: 'bb-c-bl',
        delay: 0.25
    },
    {
        pos: 'bottom-0 right-0 border-b-2 border-r-2 rounded-br-[1.125rem]',
        anim: 'bb-c-br',
        delay: 0.3
    }
];

type AuthCardProps = {
    className?: string;
    children: React.ReactNode;
};

/**
 * Login v2 card: frosted card framed by green "capture" corners that fly in. The step's
 * content is passed as children.
 */
function AuthCard({ className, children }: AuthCardProps) {
    return (
        <div
            className={cn(
                'relative w-full max-w-[30.5rem] rounded-[1.125rem] bg-[color-mix(in_oklab,var(--bg)_82%,transparent)] px-7 py-8 shadow-[0_1px_0_var(--border),0_24px_60px_-32px_rgba(0,0,0,.18)] backdrop-blur-[8px]',
                className
            )}>
            {CORNERS.map((c) => (
                <span
                    key={c.anim}
                    aria-hidden
                    className={cn(
                        'pointer-events-none absolute size-[2.125rem] border-primary',
                        c.pos
                    )}
                    style={{ animation: `${c.anim} .7s cubic-bezier(.16,1,.3,1) ${c.delay}s both` }}
                />
            ))}
            {children}
        </div>
    );
}

/** Heading whose words rise in one after another (the design's word reveal). */
function WordReveal({
    text,
    delay = 0,
    className
}: {
    text: string;
    delay?: number;
    className?: string;
}) {
    return (
        <h1
            aria-label={text}
            className={cn(
                'm-0 flex flex-wrap gap-x-[.26em] text-xl leading-[1.25] font-semibold tracking-[-0.02em] text-foreground',
                className
            )}>
            {text.split(' ').map((word, i) => (
                <span
                    key={`${word}-${i}`}
                    aria-hidden
                    className="inline-block overflow-hidden pb-0.5">
                    <span
                        className="inline-block"
                        style={{ animation: motion.word(+(delay + i * 0.07).toFixed(2)) }}>
                        {word}
                    </span>
                </span>
            ))}
        </h1>
    );
}

export { AuthCard, WordReveal };
export type { AuthCardProps };
