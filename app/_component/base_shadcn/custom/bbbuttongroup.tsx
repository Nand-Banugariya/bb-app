import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@lib/utils';
import {
    ButtonGroup as ShadcnButtonGroup,
    ButtonGroupSeparator,
    ButtonGroupText
} from '../button-group';

interface BBButtonGroupProps extends React.ComponentProps<typeof ShadcnButtonGroup> {
    children: React.ReactNode;
    /** default: card surface with a hairline ring · outlined: transparent · ghost: no chrome. */
    variant?: 'default' | 'outlined' | 'ghost';
    /** Kept for bb-app API compatibility; size the buttons inside instead. */
    size?: 'sm' | 'default' | 'lg';
}

const bbButtonGroupVariants = cva('flex w-fit items-stretch overflow-hidden rounded-md', {
    variants: {
        variant: {
            default: 'bg-card shadow-hairline',
            outlined: 'bg-transparent',
            ghost: 'bg-transparent shadow-none'
        }
    },
    defaultVariants: {
        variant: 'default'
    }
});

function BBButtonGroup({
    children,
    className,
    variant = 'default',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    size,
    orientation = 'horizontal',
    ...props
}: BBButtonGroupProps) {
    return (
        <ShadcnButtonGroup
            orientation={orientation}
            className={cn(bbButtonGroupVariants({ variant }), className)}
            {...props}>
            {children}
        </ShadcnButtonGroup>
    );
}
BBButtonGroup.displayName = 'BBButtonGroup';

const BBButtonGroupText = (props: React.ComponentProps<typeof ButtonGroupText>) => (
    <ButtonGroupText {...props} />
);
BBButtonGroupText.displayName = 'BBButtonGroupText';

const BBButtonGroupSeparator = ({
    orientation = 'vertical',
    ...props
}: React.ComponentProps<typeof ButtonGroupSeparator>) => (
    <ButtonGroupSeparator orientation={orientation} {...props} />
);
BBButtonGroupSeparator.displayName = 'BBButtonGroupSeparator';

export { BBButtonGroup, BBButtonGroupText, BBButtonGroupSeparator, bbButtonGroupVariants };
