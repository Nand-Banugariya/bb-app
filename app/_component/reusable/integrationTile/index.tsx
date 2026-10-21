import * as React from 'react';
import { cn } from '@lib/utils';

/**
 * Design system v2 · Integration tile: the tool's real logo on white (both themes), filling 66%
 * of the tile, with a 1px ring. Never a letter — pass the logo as an image URL or an SVG node.
 * Sizes: sm 20 · md 28 · lg 32 · xl 40. Square tiles (radius 6) in grids, round in "Send to" stacks.
 */
const SIZES = {
    sm: 'size-5',
    md: 'size-7',
    lg: 'size-8',
    xl: 'size-10'
} as const;

interface IntegrationTileProps extends React.ComponentProps<'span'> {
    /** Tool name — used as the accessible label and tooltip. */
    name: string;
    /** Logo image URL, or an inline SVG/icon element. */
    logo: string | React.ReactNode;
    size?: keyof typeof SIZES;
    shape?: 'square' | 'round';
}

function IntegrationTile({
    name,
    logo,
    size = 'lg',
    shape = 'square',
    className,
    ...props
}: IntegrationTileProps) {
    return (
        <span
            role="img"
            aria-label={name}
            title={name}
            data-slot="integration-tile"
            className={cn(
                'inline-grid shrink-0 place-items-center overflow-hidden bg-white shadow-hairline',
                SIZES[size],
                shape === 'round' ? 'rounded-full' : 'rounded-md',
                className
            )}
            {...props}>
            {typeof logo === 'string' ? (
                // eslint-disable-next-line @next/next/no-img-element -- third-party logos of unknown size
                <img src={logo} alt="" className="size-2/3 object-contain" />
            ) : (
                <span className="grid size-2/3 place-items-center [&>svg]:size-full">{logo}</span>
            )}
        </span>
    );
}

interface IntegrationStackProps extends React.ComponentProps<'span'> {
    tools: { name: string; logo: string | React.ReactNode }[];
    size?: keyof typeof SIZES;
}

/** Overlapping round tiles, e.g. the selected tools in "Send to". */
function IntegrationStack({ tools, size = 'md', className, ...props }: IntegrationStackProps) {
    return (
        <span className={cn('flex pl-0.5', className)} {...props}>
            {tools.map((tool, i) => (
                <IntegrationTile
                    key={tool.name}
                    name={tool.name}
                    logo={tool.logo}
                    size={size}
                    shape="round"
                    className={cn(
                        'shadow-[0_0_0_2px_var(--card),0_0_0_3px_var(--d200)]',
                        i > 0 && '-ml-1.5'
                    )}
                />
            ))}
        </span>
    );
}

export { IntegrationTile, IntegrationStack };
export type { IntegrationTileProps, IntegrationStackProps };
