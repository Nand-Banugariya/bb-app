import * as React from 'react';
import { cn } from '@lib/utils';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../resizable';

interface BBResizablePanelGroupProps extends React.ComponentProps<typeof ResizablePanelGroup> {
    /** bordered: 1px ring, radius 8 · elevated: ring + menu shadow. */
    variant?: 'default' | 'bordered' | 'elevated';
}

const BBResizablePanelGroup = ({
    className,
    variant = 'default',
    ...props
}: BBResizablePanelGroupProps) => (
    <ResizablePanelGroup
        className={cn(
            variant === 'bordered' && 'rounded-lg shadow-sh',
            variant === 'elevated' && 'rounded-lg shadow-sh-lg',
            className
        )}
        {...props}
    />
);
BBResizablePanelGroup.displayName = 'BBResizablePanelGroup';

interface BBResizablePanelProps extends React.ComponentProps<typeof ResizablePanel> {
    /** card: card surface · muted: recessed sidebar surface. */
    variant?: 'default' | 'card' | 'muted';
}

const BBResizablePanel = ({ className, variant = 'default', ...props }: BBResizablePanelProps) => (
    <ResizablePanel
        className={cn(
            variant === 'card' && 'bg-card text-card-foreground',
            variant === 'muted' && 'bg-side',
            className
        )}
        {...props}
    />
);
BBResizablePanel.displayName = 'BBResizablePanel';

interface BBResizableHandleProps extends React.ComponentProps<typeof ResizableHandle> {
    /** accent: green line · subtle: faint line that darkens on hover. Default turns green on hover/drag. */
    variant?: 'default' | 'accent' | 'subtle';
}

const BBResizableHandle = ({
    className,
    variant = 'default',
    ...props
}: BBResizableHandleProps) => (
    <ResizableHandle
        className={cn(
            variant === 'accent' && 'bg-primary hover:bg-primary-hover',
            variant === 'subtle' && 'bg-d200/50 hover:bg-d300',
            className
        )}
        {...props}
    />
);
BBResizableHandle.displayName = 'BBResizableHandle';

export { BBResizablePanelGroup, BBResizablePanel, BBResizableHandle };
