import { Skeleton } from '@components/base_shadcn/skeleton';

/**
 * Placeholder for the onboarding card while the route resolves (auth check). Mirrors the
 * profile step: progress, title + one line, name and role fields, industry chips, Next.
 */
const UserOnboardingSkeleton = () => (
    <div
        role="status"
        aria-label="Loading onboarding"
        className="flex w-full max-w-[30.5rem] flex-col gap-6 px-7 py-8">
        <div className="grid grid-cols-2 gap-1.5">
            <Skeleton className="h-1 w-full" />
            <Skeleton tone="subtle" className="h-1 w-full" />
        </div>
        <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-52" />
            <Skeleton tone="subtle" className="h-4 w-72" />
        </div>
        {[0, 1].map((i) => (
            <div key={i} className="flex flex-col gap-2">
                <Skeleton tone="subtle" className="h-4 w-40" />
                <Skeleton className="h-10 w-full" />
            </div>
        ))}
        <div className="flex flex-col gap-2">
            <Skeleton tone="subtle" className="h-4 w-20" />
            <div className="flex flex-wrap gap-2">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-[2.125rem] w-24" />
                ))}
            </div>
        </div>
        <Skeleton className="h-10 w-full" />
    </div>
);

export default UserOnboardingSkeleton;
