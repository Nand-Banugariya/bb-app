'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BbButton from '@components/base_shadcn/custom/bbbutton';
import { contactSupport } from '@lib/support';

/** "Go home / Go back / Contact support" for the 404 page. */
const NotFoundActions = () => {
    const router = useRouter();

    const goBack = () => {
        // Opened straight from a link (new tab, email): there's nothing to go
        // back to, so go home instead.
        if (window.history.length > 1) router.back();
        else router.push('/');
    };

    return (
        <div className="flex flex-wrap items-center justify-center gap-2">
            <BbButton asChild>
                <Link href="/">Go home</Link>
            </BbButton>
            <BbButton variant="secondary" onClick={goBack}>
                Go back
            </BbButton>
            <BbButton variant="ghost" onClick={() => contactSupport('Page not found')}>
                Contact support
            </BbButton>
        </div>
    );
};

export default NotFoundActions;
