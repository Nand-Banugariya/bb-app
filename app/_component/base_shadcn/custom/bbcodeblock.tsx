import * as React from 'react';
import { cn } from '@lib/utils';

/**
 * Design system v2 · Code / log block. Google Sans everywhere (IDs, logs and keys too), 13px,
 * recessed d100 surface with a hairline ring, radius 8, scrolls sideways when needed.
 */
const BBCodeBlock = ({ className, children, ...props }: React.ComponentProps<'div'>) => (
    <div
        className={cn(
            'overflow-x-auto rounded-lg bg-d100 p-4 font-mono text-sm whitespace-pre-wrap text-muted-foreground shadow-hairline',
            className
        )}
        {...props}>
        {children}
    </div>
);
BBCodeBlock.displayName = 'BBCodeBlock';

export { BBCodeBlock };
