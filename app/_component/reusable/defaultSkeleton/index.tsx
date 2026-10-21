'use client';
import { usePathname } from 'next/navigation';
import { Spinner } from '@components/base_shadcn/spinner';
import { cn } from '@lib/utils';

interface DefaultSkeletonProps {
    /** Inline loader for a content area instead of the full-screen overlay. */
    isContent?: boolean;
    className?: string;
}

/**
 * Full-screen loader (short waits only — page loads use skeletons that match the layout).
 * On /login it sits a quarter of the way down instead of centred.
 */
const DefaultSkeleton = ({ isContent = false, className }: DefaultSkeletonProps) => {
    const pathname = usePathname();

    return (
        <div
            role="status"
            aria-label="Loading"
            className={cn(
                isContent
                    ? 'relative my-auto flex min-h-max items-center justify-center'
                    : 'fixed inset-0 z-[1000] flex items-center justify-center',
                !isContent && pathname === '/login' && 'top-1/4 items-start',
                className
            )}>
            <Spinner aria-hidden role={undefined} className="size-8 text-primary" />
        </div>
    );
};

export default DefaultSkeleton;
