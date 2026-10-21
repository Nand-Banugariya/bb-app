import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import AuthLayout from '@components/layouts/authLayout';
import { OnboardingShowcase } from '@components/common/onboardingShowcase';
import { OnboardingProvider } from '@components/contexts/onboardingContext';

export const metadata: Metadata = {
    title: 'Set up your profile',
    description: 'Tell us a bit about you to finish setting up BetterBugs.'
};

// The provider wraps the whole shell so the right panel can follow the form's step.
export default function UserOnboardingLayout({ children }: { children: ReactNode }) {
    return (
        <OnboardingProvider>
            <AuthLayout variant="onboarding" aside={<OnboardingShowcase />}>
                {children}
            </AuthLayout>
        </OnboardingProvider>
    );
}
