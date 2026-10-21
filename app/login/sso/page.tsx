import type { Metadata } from 'next';
import SSOController from './sso.controller';

export const metadata: Metadata = { title: 'Single sign-on' };

// useSearchParams in the controller resolves inside the /login loading.tsx Suspense boundary.
export default function SSOPage() {
    return <SSOController />;
}
