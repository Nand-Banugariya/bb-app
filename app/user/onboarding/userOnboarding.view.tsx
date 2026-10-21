'use client';

import * as React from 'react';
import Image from 'next/image';
import { CircleFlag } from 'react-circle-flags';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from '@components/base_shadcn/command';
import { Input } from '@components/base_shadcn/input';
import { Label } from '@components/base_shadcn/label';
import { Popover, PopoverContent, PopoverTrigger } from '@components/base_shadcn/popover';
import BbButton from '@components/base_shadcn/custom/bbbutton';
import BbSelect, {
    BbSelectContent,
    BbSelectItem,
    BbSelectTrigger,
    BbSelectValue
} from '@components/base_shadcn/custom/bbselect';
import { fieldOpenClasses, fieldVariants } from '@components/base_shadcn/custom/field-variants';
import { AuthCard } from '@components/common/authCard';
import { motion, shake } from '@components/common/authCard/authMotion';
import type { OnboardingStep, UserOnboardingForm } from '@components/contexts/onboardingContext';
import {
    ArrowForwardIcon,
    BlockIcon,
    CheckIcon,
    ErrorIcon,
    ExpandMoreIcon,
    ExtensionIcon
} from '@components/icons/material';
import {
    PM_TOOLS,
    PM_TOOL_NONE,
    heardAboutUs,
    industries,
    rolesOptions,
    teamSizes
} from '@lib/constants';
import { COUNTRIES } from '@lib/countries';
import { cn } from '@lib/utils';

/* -------------------------------------------------------------------------------------------- */
/* Shared bits                                                                                  */
/* -------------------------------------------------------------------------------------------- */

const FIELD = 'h-10 rounded-[0.625rem] px-3.5 text-lg';
const BUTTON =
    'h-10 rounded-[0.625rem] text-lg font-medium transition-[color,background-color,box-shadow,opacity,transform] hover:-translate-y-px active:scale-[.97] disabled:translate-y-0';
const PRIMARY_GLOW = 'shadow-[0_6px_20px_-8px_rgba(0,218,146,.7)]';
const LABEL = 'gap-0 px-0 text-lg leading-normal font-medium text-foreground';

/** Ring for a pickable chip / tile: selected, invalid, or idle. */
const choiceClasses = (selected: boolean, invalid: boolean) =>
    cn(
        'cursor-pointer text-foreground transition-[box-shadow,background-color] outline-none hover:shadow-[0_0_0_1px_var(--primary)] focus-visible:shadow-focus',
        selected
            ? 'bg-spot font-medium shadow-[0_0_0_1px_var(--primary)]'
            : invalid
              ? 'bg-background shadow-error'
              : 'bg-background shadow-hairline'
    );

function Required() {
    return (
        <span aria-hidden className="text-destructive">
            *
        </span>
    );
}

function FieldError({ children }: { children: React.ReactNode }) {
    return (
        <span
            role="alert"
            className="flex items-center gap-1.5 text-sm text-destructive [&>svg]:size-3.5 [&>svg]:shrink-0"
            style={{ animation: motion.pop() }}>
            <ErrorIcon aria-hidden />
            {children}
        </span>
    );
}

/** Single-choice row of chips (industry, team size, where they heard about us). */
function ChoiceChips({
    options,
    value,
    onChange,
    invalid,
    ariaLabel,
    className,
    chipClassName
}: {
    options: string[];
    value: string;
    onChange: (value: string) => void;
    invalid: boolean;
    ariaLabel: string;
    className?: string;
    chipClassName?: string;
}) {
    return (
        <div
            role="radiogroup"
            aria-label={ariaLabel}
            className={cn('flex flex-wrap gap-2', className)}>
            {options.map((option) => (
                <button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={option === value}
                    onClick={() => onChange(option)}
                    className={cn(
                        'h-[2.125rem] rounded-[0.625rem] px-3.5 text-md whitespace-nowrap',
                        choiceClasses(option === value, invalid),
                        chipClassName
                    )}>
                    {option}
                </button>
            ))}
        </div>
    );
}

// Round flag SVGs from react-circle-flags, as in bb-app's CountryDropdown.
function Flag({ code }: { code: string }) {
    return (
        <CircleFlag
            countryCode={code}
            height={20}
            alt=""
            className="size-5 shrink-0 rounded-full object-cover shadow-[0_0_0_1px_var(--border)]"
        />
    );
}

/** Company location: searchable list of countries with their flags (optional). */
function CountryField({ value, onChange }: { value: string; onChange: (name: string) => void }) {
    const [open, setOpen] = React.useState(false);
    const selected = COUNTRIES.find((c) => c.name === value);

    return (
        <Popover open={open} onOpenChange={setOpen} modal>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    id="onboarding-country"
                    role="combobox"
                    aria-expanded={open}
                    aria-controls="onboarding-country-list"
                    aria-haspopup="listbox"
                    className={cn(
                        fieldVariants(),
                        fieldOpenClasses,
                        FIELD,
                        'cursor-pointer items-center gap-2.5 pr-3 text-left',
                        selected ? 'text-foreground' : 'text-muted-foreground'
                    )}>
                    {selected && <Flag code={selected.code} />}
                    <span className="min-w-0 flex-1 truncate">
                        {selected ? selected.name : 'Select a country'}
                    </span>
                    <ExpandMoreIcon
                        aria-hidden
                        className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 in-aria-expanded:rotate-180"
                    />
                </button>
            </PopoverTrigger>
            <PopoverContent
                id="onboarding-country-list"
                align="start"
                className="w-(--radix-popover-trigger-width) rounded-xl p-0">
                <Command
                    filter={(itemValue, search) =>
                        !search || itemValue.toLowerCase().includes(search.toLowerCase().trim())
                            ? 1
                            : 0
                    }>
                    <CommandInput placeholder="Search country…" />
                    <CommandList className="max-h-[14.5rem]">
                        <CommandEmpty>No countries match.</CommandEmpty>
                        <CommandGroup>
                            {COUNTRIES.map((country) => (
                                <CommandItem
                                    key={country.code}
                                    value={country.name}
                                    onSelect={() => {
                                        onChange(country.name === value ? '' : country.name);
                                        setOpen(false);
                                    }}
                                    className="h-9 gap-2.5 rounded-lg">
                                    <Flag code={country.code} />
                                    <span className="flex-1 truncate">{country.name}</span>
                                    <CheckIcon
                                        aria-hidden
                                        className={cn(
                                            'size-[1.125rem] shrink-0 text-primary',
                                            country.name === value ? 'opacity-100' : 'opacity-0'
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

function ToolLogo({ toolKey, darkLogo }: { toolKey: string; darkLogo?: boolean }) {
    if (toolKey === PM_TOOL_NONE) {
        return <BlockIcon aria-hidden className="size-[1.375rem] text-muted-foreground" />;
    }
    const logo = (src: string, className?: string) => (
        <Image
            src={src}
            alt=""
            width={24}
            height={24}
            unoptimized
            className={cn('size-6', className)}
        />
    );
    if (!darkLogo) return logo(`/images/pm-tools/${toolKey}.svg`);
    return (
        <>
            {logo(`/images/pm-tools/${toolKey}.svg`, 'dark:hidden')}
            {logo(`/images/pm-tools/${toolKey}-dark.svg`, 'hidden dark:block')}
        </>
    );
}

/* -------------------------------------------------------------------------------------------- */
/* View                                                                                         */
/* -------------------------------------------------------------------------------------------- */

export type UserOnboardingErrors = Partial<Record<keyof UserOnboardingForm, string>>;

interface UserOnboardingViewProps {
    step: OnboardingStep;
    /** Slide direction for the step that just appeared. */
    direction: 'fwd' | 'back';
    form: UserOnboardingForm;
    setField: <K extends keyof UserOnboardingForm>(key: K, value: UserOnboardingForm[K]) => void;
    toggleTool: (key: string) => void;
    errors: UserOnboardingErrors;
    /** Increments on every rejected Next / Continue, to replay the shake. */
    shakeKey: number;
    onNext: () => void;
    onBack: () => void;
    onSubmit: () => void;
    isSubmitting: boolean;
    isExtensionInstalled: boolean;
    onGoToDashboard: () => void;
    onInstallExtension: () => void;
}

/** Onboarding v4 (BetterBugs Onboarding.html): profile → tools → workspace ready, in the capture card. */
const UserOnboardingView = ({
    step,
    direction,
    form,
    setField,
    toggleTool,
    errors,
    shakeKey,
    onNext,
    onBack,
    onSubmit,
    isSubmitting,
    isExtensionInstalled,
    onGoToDashboard,
    onInstallExtension
}: UserOnboardingViewProps) => {
    const actionRef = React.useRef<HTMLButtonElement>(null);
    React.useEffect(() => {
        if (shakeKey > 0) shake(actionRef.current);
    }, [shakeKey]);

    const pickedTools = form.tools.filter((t) => t !== PM_TOOL_NONE).length;
    const firstName = form.name.trim().split(/\s+/)[0] || 'there';

    return (
        <AuthCard>
            <span
                className="absolute -top-2.5 left-[2.875rem] flex items-center gap-1.5 rounded-lg border border-border bg-background px-2 py-0.5 font-mono text-2xs whitespace-nowrap text-muted-foreground"
                style={{ animation: motion.pop(0.5, 0.4) }}>
                <span
                    aria-hidden
                    className="size-1.5 rounded-full bg-primary"
                    style={{ animation: motion.pulse }}
                />
                {step === 3 ? 'workspace ready' : `step ${step} of 2`}
            </span>

            {step < 3 && (
                <div aria-hidden className="mb-6 grid grid-cols-2 gap-1.5">
                    <span className="h-1 rounded-full bg-primary" />
                    <span className="h-1 overflow-hidden rounded-full bg-muted">
                        <span
                            className="block h-full rounded-full bg-primary transition-[width] duration-[600ms] ease-[cubic-bezier(.16,1,.3,1)]"
                            style={{ width: step >= 2 ? '100%' : '0%' }}
                        />
                    </span>
                </div>
            )}

            {step === 1 && (
                <form
                    key="profile"
                    noValidate
                    onSubmit={(event) => {
                        event.preventDefault();
                        onNext();
                    }}
                    className="flex flex-col gap-6"
                    style={{ animation: motion.step(direction) }}>
                    <div className="flex flex-col gap-1.5">
                        <h1 className="text-xl leading-[1.25] font-semibold tracking-[-0.02em]">
                            Let&apos;s get to know you
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            A few details to set up your workspace
                        </p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="onboarding-name" className={LABEL}>
                            Your name
                            <Required />
                        </Label>
                        <Input
                            id="onboarding-name"
                            value={form.name}
                            onChange={(event) => setField('name', event.target.value)}
                            placeholder="Enter your name"
                            autoComplete="name"
                            aria-invalid={errors.name ? true : undefined}
                            className={FIELD}
                        />
                        {errors.name && <FieldError>{errors.name}</FieldError>}
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="onboarding-role" className={LABEL}>
                            What best describes your work?
                            <Required />
                        </Label>
                        <BbSelect
                            value={form.role}
                            onValueChange={(value) => setField('role', value)}
                            error={!!errors.role}>
                            <BbSelectTrigger
                                id="onboarding-role"
                                className={cn(FIELD, 'pr-3 [&_svg]:size-5')}>
                                <BbSelectValue placeholder="e.g. Developer, QA" />
                            </BbSelectTrigger>
                            <BbSelectContent position="popper" className="rounded-xl">
                                {rolesOptions.map((role) => (
                                    <BbSelectItem
                                        key={role}
                                        value={role}
                                        className="h-9 rounded-lg">
                                        {role}
                                    </BbSelectItem>
                                ))}
                            </BbSelectContent>
                        </BbSelect>
                        {errors.role && <FieldError>{errors.role}</FieldError>}
                    </div>

                    <div className="flex flex-col gap-2">
                        <span className={LABEL}>
                            Industry
                            <Required />
                        </span>
                        <ChoiceChips
                            ariaLabel="Industry"
                            options={industries}
                            value={form.industry}
                            onChange={(value) => setField('industry', value)}
                            invalid={!!errors.industry}
                        />
                        {errors.industry && <FieldError>{errors.industry}</FieldError>}
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="onboarding-country" className={LABEL}>
                            Company location
                        </Label>
                        <CountryField
                            value={form.country}
                            onChange={(value) => setField('country', value)}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <span className={LABEL}>
                            Team size
                            <Required />
                        </span>
                        <ChoiceChips
                            ariaLabel="Team size"
                            options={teamSizes}
                            value={form.teamSize}
                            onChange={(value) => setField('teamSize', value)}
                            invalid={!!errors.teamSize}
                            className="grid grid-cols-5"
                            chipClassName="h-9 px-0"
                        />
                        {errors.teamSize && <FieldError>{errors.teamSize}</FieldError>}
                    </div>

                    <BbButton
                        ref={actionRef}
                        type="submit"
                        className={cn(BUTTON, PRIMARY_GLOW, 'mt-1')}>
                        Next
                        <ArrowForwardIcon aria-hidden className="size-[1.125rem]" />
                    </BbButton>
                </form>
            )}

            {step === 2 && (
                <form
                    key="tools"
                    noValidate
                    onSubmit={(event) => {
                        event.preventDefault();
                        onSubmit();
                    }}
                    className="flex flex-col gap-6"
                    style={{ animation: motion.step(direction) }}>
                    <div className="flex flex-col gap-1.5">
                        <h1 className="text-xl leading-[1.25] font-semibold tracking-[-0.02em]">
                            Connect your workflow
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Send bug reports straight to the tools you use
                        </p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <span id="onboarding-tools-label" className={LABEL}>
                            Which project management tools does your company use?
                            <Required />
                        </span>
                        <span className="text-sm text-muted-foreground">
                            {pickedTools ? `${pickedTools} selected` : 'Select all that apply'}
                        </span>
                        <div
                            role="group"
                            aria-labelledby="onboarding-tools-label"
                            className="mt-1 grid grid-cols-[repeat(auto-fill,minmax(6rem,1fr))] gap-2">
                            {PM_TOOLS.map((tool) => {
                                const selected = form.tools.includes(tool.key);
                                return (
                                    <button
                                        key={tool.key}
                                        type="button"
                                        aria-pressed={selected}
                                        onClick={() => toggleTool(tool.key)}
                                        className={cn(
                                            'relative flex h-[4.75rem] flex-col items-center justify-center gap-2 rounded-xl p-1.5 text-sm',
                                            choiceClasses(selected, !!errors.tools)
                                        )}>
                                        <span className="flex size-6 items-center justify-center">
                                            <ToolLogo toolKey={tool.key} darkLogo={tool.darkLogo} />
                                        </span>
                                        <span className="w-full text-center leading-[1.2]">
                                            {tool.label}
                                        </span>
                                        {selected && (
                                            <span
                                                aria-hidden
                                                className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground"
                                                style={{ animation: motion.scale() }}>
                                                <CheckIcon className="size-3" />
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        {errors.tools && <FieldError>{errors.tools}</FieldError>}
                    </div>

                    <div className="flex flex-col gap-2">
                        <span className={LABEL}>
                            Where did you hear about us?
                            <Required />
                        </span>
                        <ChoiceChips
                            ariaLabel="Where did you hear about us?"
                            options={heardAboutUs}
                            value={form.heardFrom}
                            onChange={(value) => setField('heardFrom', value)}
                            invalid={!!errors.heardFrom}
                        />
                        {errors.heardFrom && <FieldError>{errors.heardFrom}</FieldError>}
                    </div>

                    <div className="mt-1 grid grid-cols-[1fr_2fr] gap-2.5">
                        <BbButton
                            variant="secondary"
                            onClick={onBack}
                            disabled={isSubmitting}
                            className={BUTTON}>
                            Back
                        </BbButton>
                        <BbButton
                            ref={actionRef}
                            type="submit"
                            loading={isSubmitting}
                            loadingText="Setting up workspace…"
                            className={cn(BUTTON, PRIMARY_GLOW)}>
                            Continue
                        </BbButton>
                    </div>
                </form>
            )}

            {step === 3 && (
                <div
                    className="flex flex-col items-center gap-5 py-3 text-center"
                    style={{ animation: motion.up(0, 0.6) }}>
                    <span
                        aria-hidden
                        className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground"
                        style={{ animation: 'bb-scale .5s cubic-bezier(.34,1.56,.64,1) both' }}>
                        <CheckIcon className="size-7" />
                    </span>
                    <div className="flex flex-col gap-1.5">
                        <h1 className="text-xl leading-[1.25] font-semibold tracking-[-0.02em]">
                            You&apos;re all set, {firstName}
                        </h1>
                        <p className="text-lg text-pretty text-muted-foreground">
                            {isExtensionInstalled
                                ? 'Your workspace is ready. Capture your first bug from the extension.'
                                : 'Install the browser extension to capture your first bug.'}
                        </p>
                    </div>
                    <div
                        className={cn(
                            'grid w-full gap-2.5',
                            isExtensionInstalled ? 'grid-cols-1' : 'grid-cols-2'
                        )}>
                        <BbButton
                            variant={isExtensionInstalled ? 'default' : 'secondary'}
                            onClick={onGoToDashboard}
                            className={cn(BUTTON, 'text-md')}>
                            Go to dashboard
                        </BbButton>
                        {!isExtensionInstalled && (
                            <BbButton
                                onClick={onInstallExtension}
                                className={cn(BUTTON, 'text-md')}>
                                <ExtensionIcon aria-hidden className="size-4" />
                                Install extension
                            </BbButton>
                        )}
                    </div>
                </div>
            )}
        </AuthCard>
    );
};

export default UserOnboardingView;
