'use client';

import { Button } from '@components/base_shadcn/button';
import { Tabs, TabsList, TabsTrigger } from '@components/base_shadcn/tabs';
import { BBTooltip } from '@components/base_shadcn/custom/bbtooltip';
import { ComputerIcon, DarkModeIcon, LightModeIcon } from '@components/icons/material';
import { useTheme } from '@components/contexts/themeContext';
import { isThemePreference, type ThemePreference } from '@lib/themeInit';
import { cn } from '@lib/utils';

const OPTIONS: { value: ThemePreference; label: string; Icon: typeof LightModeIcon }[] = [
    { value: 'LIGHT', label: 'Light', Icon: LightModeIcon },
    { value: 'DARK', label: 'Dark', Icon: DarkModeIcon },
    { value: 'SYSTEM', label: 'System', Icon: ComputerIcon }
];

type ThemeSwitcherProps = {
    /** Icons only, label in a tooltip (for tight spots like the user menu). */
    iconOnly?: boolean;
    className?: string;
};

/** Light / Dark / System picker — the design system's segmented control. */
function ThemeSwitcher({ iconOnly = false, className }: ThemeSwitcherProps) {
    const { preference, setPreference } = useTheme();

    return (
        <Tabs
            value={preference}
            onValueChange={(value) => isThemePreference(value) && setPreference(value)}
            className={cn('gap-0', className)}>
            <TabsList aria-label="Theme">
                {OPTIONS.map(({ value, label, Icon }) =>
                    iconOnly ? (
                        <BBTooltip key={value} content={label}>
                            <TabsTrigger value={value} aria-label={label}>
                                <Icon />
                            </TabsTrigger>
                        </BBTooltip>
                    ) : (
                        <TabsTrigger key={value} value={value}>
                            <Icon />
                            {label}
                        </TabsTrigger>
                    )
                )}
            </TabsList>
        </Tabs>
    );
}

/** One-click light/dark toggle (moon in light, sun in dark) — for headers like the login page. */
function ThemeToggleButton({ className }: { className?: string }) {
    const { resolvedTheme, setPreference } = useTheme();
    const isDark = resolvedTheme === 'dark';
    const label = isDark ? 'Switch to light theme' : 'Switch to dark theme';

    return (
        <BBTooltip content={label}>
            <Button
                variant="ghost"
                size="icon-md"
                aria-label={label}
                className={className}
                onClick={() => setPreference(isDark ? 'LIGHT' : 'DARK')}>
                {isDark ? <LightModeIcon /> : <DarkModeIcon />}
            </Button>
        </BBTooltip>
    );
}

export { ThemeSwitcher, ThemeToggleButton };
export type { ThemeSwitcherProps };
