'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
    useOnboardingContext,
    type UserOnboardingForm
} from '@components/contexts/onboardingContext';
import { PM_TOOL_NONE, chromExtensionId, edgeExtensionId, getExtensionUrl } from '@lib/constants';
import { checkBrowserExtensions } from '@lib/helpers';
import UserOnboardingView, { type UserOnboardingErrors } from './userOnboarding.view';

interface UserOnboardingControllerProps {
    /** Prefill for "Your name": the account's name, else the email's local part. */
    defaultName: string;
}

const validateProfile = (form: UserOnboardingForm): UserOnboardingErrors => {
    const errors: UserOnboardingErrors = {};
    if (!form.name.trim()) errors.name = 'Enter your name';
    if (!form.role) errors.role = 'Choose what best describes your work';
    if (!form.industry) errors.industry = 'Choose an industry';
    if (!form.teamSize) errors.teamSize = 'Choose your team size';
    return errors;
};

const validateTools = (form: UserOnboardingForm): UserOnboardingErrors => {
    const errors: UserOnboardingErrors = {};
    if (!form.tools.length) errors.tools = 'Pick at least one tool, or choose None';
    if (!form.heardFrom) errors.heardFrom = 'Let us know where you heard about us';
    return errors;
};

const hasErrors = (errors: UserOnboardingErrors) => Object.keys(errors).length > 0;

/**
 * User onboarding: profile (step 1) and tools (step 2), then bb-app's submit flow from the
 * onboarding context — save the answers, then either "workspace ready" (step 3) or on to
 * workspace onboarding when there's a team to join. Errors show once a step has been tried and
 * update as the user fixes them.
 */
const UserOnboardingController = ({ defaultName }: UserOnboardingControllerProps) => {
    const router = useRouter();
    const { onboardingStep, setOnboardingStep, isSubmitting, handleUserOnboardingSubmit } =
        useOnboardingContext();

    const [form, setForm] = React.useState<UserOnboardingForm>({
        name: defaultName,
        role: '',
        industry: '',
        country: '',
        teamSize: '',
        tools: [],
        heardFrom: ''
    });
    const [direction, setDirection] = React.useState<'fwd' | 'back'>('fwd');
    const [triedStep, setTriedStep] = React.useState<{ 1: boolean; 2: boolean }>({
        1: false,
        2: false
    });
    const [shakeKey, setShakeKey] = React.useState(0);
    const [isExtensionInstalled, setIsExtensionInstalled] = React.useState(false);

    React.useEffect(() => {
        checkBrowserExtensions(chromExtensionId, edgeExtensionId, (installed) => {
            if (installed) setIsExtensionInstalled(true);
        });
    }, []);

    const errors: UserOnboardingErrors =
        onboardingStep === 1 && triedStep[1]
            ? validateProfile(form)
            : onboardingStep === 2 && triedStep[2]
              ? validateTools(form)
              : {};

    const setField = <K extends keyof UserOnboardingForm>(key: K, value: UserOnboardingForm[K]) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    // "None" can't be picked together with a tool.
    const toggleTool = (key: string) =>
        setForm((prev) => {
            if (key === PM_TOOL_NONE) {
                return { ...prev, tools: prev.tools.includes(PM_TOOL_NONE) ? [] : [PM_TOOL_NONE] };
            }
            const tools = prev.tools.filter((t) => t !== PM_TOOL_NONE);
            return {
                ...prev,
                tools: tools.includes(key) ? tools.filter((t) => t !== key) : [...tools, key]
            };
        });

    const onNext = () => {
        if (hasErrors(validateProfile(form))) {
            setTriedStep((prev) => ({ ...prev, 1: true }));
            setShakeKey((k) => k + 1);
            return;
        }
        setDirection('fwd');
        setOnboardingStep(2);
    };

    const onBack = () => {
        setDirection('back');
        setOnboardingStep(1);
    };

    const onSubmit = () => {
        if (isSubmitting) return;
        if (hasErrors(validateTools(form))) {
            setTriedStep((prev) => ({ ...prev, 2: true }));
            setShakeKey((k) => k + 1);
            return;
        }
        void handleUserOnboardingSubmit(form);
    };

    return (
        <UserOnboardingView
            step={onboardingStep}
            direction={direction}
            form={form}
            setField={setField}
            toggleTool={toggleTool}
            errors={errors}
            shakeKey={shakeKey}
            onNext={onNext}
            onBack={onBack}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            isExtensionInstalled={isExtensionInstalled}
            // `/` works out where to land (Get Started for new users).
            onGoToDashboard={() => router.replace('/')}
            onInstallExtension={() => window.open(getExtensionUrl, '_blank', 'noopener,noreferrer')}
        />
    );
};

export default UserOnboardingController;
