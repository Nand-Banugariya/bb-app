import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@components/base_shadcn/avatar';
import { cn } from '@lib/utils';

/**
 * Design system v2 · Avatar: 22 · 28 · 32px (sm · default · lg), white initials on one of the
 * five avatar colours. The colour is picked from the name, so a person keeps the same colour
 * everywhere. Stacks overlap −6px with a 2px card-coloured ring.
 */
const AVATAR_COLORS = [
    'bg-avatar-1',
    'bg-avatar-2',
    'bg-avatar-3',
    'bg-avatar-4',
    'bg-avatar-5'
] as const;

type AvatarSize = 'sm' | 'default' | 'lg';

/** "Aarav Mehta" → "AM", "riya@linearloop.io" → "R". */
function getInitials(name: string) {
    const words = name
        .split('@')[0]
        .trim()
        .split(/[\s._-]+/)
        .filter(Boolean);
    if (!words.length) return '?';
    const first = words[0][0] ?? '';
    const last = words.length > 1 ? words[words.length - 1][0] : '';
    return (first + last).toUpperCase();
}

/** Stable avatar colour class for a name or id. */
function getAvatarColor(seed: string) {
    // FNV-1a: spreads similar names across the 5 colours (a *31 hash mod 5 collapses to the
    // sum of the char codes, so many names collided).
    let hash = 0x811c9dc5;
    for (let i = 0; i < seed.length; i++) {
        hash ^= seed.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

interface UserAvatarProps extends Omit<React.ComponentProps<typeof Avatar>, 'children'> {
    name: string;
    /** Profile image; initials show until it loads or if it fails. */
    src?: string | null;
    size?: AvatarSize;
    /** Overrides the name-based colour, e.g. for the current user. */
    colorSeed?: string;
}

function UserAvatar({
    name,
    src,
    size = 'default',
    colorSeed,
    className,
    ...props
}: UserAvatarProps) {
    return (
        <Avatar size={size} className={className} title={name} {...props}>
            {src ? <AvatarImage src={src} alt={name} /> : null}
            <AvatarFallback className={getAvatarColor(colorSeed ?? name)}>
                {getInitials(name)}
            </AvatarFallback>
        </Avatar>
    );
}

interface AvatarStackProps extends React.ComponentProps<'div'> {
    users: { name: string; src?: string | null; id?: string }[];
    /** Avatars shown before the "+N" counter. */
    max?: number;
    size?: AvatarSize;
}

function AvatarStack({ users, max = 3, size = 'default', className, ...props }: AvatarStackProps) {
    const visible = users.slice(0, max);
    const rest = users.length - visible.length;
    return (
        <div
            data-slot="avatar-stack"
            className={cn('flex items-center -space-x-1.5', className)}
            {...props}>
            {visible.map((user) => (
                <UserAvatar
                    key={user.id ?? user.name}
                    name={user.name}
                    src={user.src}
                    colorSeed={user.id}
                    size={size}
                    className="ring-2 ring-card"
                />
            ))}
            {rest > 0 && (
                <span
                    title={users
                        .slice(max)
                        .map((u) => u.name)
                        .join(', ')}
                    className={cn(
                        'relative flex shrink-0 items-center justify-center rounded-full bg-d100 text-2xs font-semibold text-foreground ring-2 ring-card',
                        size === 'sm' && 'size-[1.375rem]',
                        size === 'default' && 'size-7',
                        size === 'lg' && 'size-8 text-xs'
                    )}>
                    +{rest}
                </span>
            )}
        </div>
    );
}

export { UserAvatar, AvatarStack, getInitials, getAvatarColor };
export type { UserAvatarProps, AvatarStackProps };
