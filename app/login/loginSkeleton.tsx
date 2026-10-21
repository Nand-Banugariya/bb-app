import { Skeleton } from '@components/base_shadcn/skeleton';

/**
 * Placeholder for the sign-in form while the route resolves (auth check, search params).
 * Mirrors login.view: logo, title + one line, email field, Continue, divider, three providers.
 */
const LoginSkeleton = () => (
    <div role="status" aria-label="Loading sign-in" className="flex w-full flex-col">
        <div className="flex justify-center py-8 md:p-0">
            <Skeleton className="h-6 w-36" />
        </div>
        <div className="flex flex-col items-center gap-2 py-6">
            <Skeleton className="h-6 w-64" />
            <Skeleton tone="subtle" className="h-3.5 w-56" />
        </div>
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
                <Skeleton tone="subtle" className="h-3 w-10" />
                <Skeleton className="h-9 w-full" />
            </div>
            <Skeleton className="h-9 w-full" />
        </div>
        <div className="flex flex-col gap-3 pt-12">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
        </div>
    </div>
);

export default LoginSkeleton;
