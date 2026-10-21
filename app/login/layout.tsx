import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import AuthLayout from '@components/layouts/authLayout';
import { OnboardingProvider } from '@components/contexts/onboardingContext';

export const metadata: Metadata = {
    title: 'Sign in',
    description: 'Sign in to BetterBugs or create an account.'
};

export default function LoginLayout({ children }: { children: ReactNode }) {
    return (
        <AuthLayout>
            <OnboardingProvider>{children}</OnboardingProvider>
        </AuthLayout>
    );
}
