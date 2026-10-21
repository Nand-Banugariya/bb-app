import { Skeleton } from '../skeleton';

interface BBSkeletonProps extends React.ComponentProps<typeof Skeleton> {
    /** Kept for bb-app compatibility. The design system uses one pulse (1.6s) for every skeleton. */
    shimmer?: boolean;
}

/** Same as `Skeleton` (kept as the BB* entry point). Use `tone="subtle"` for secondary lines. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function BBSkeleton({ shimmer, ...props }: BBSkeletonProps) {
    return <Skeleton {...props} />;
}

export { BBSkeleton };
