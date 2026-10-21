'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '../alert';
import BbButton from './bbbutton';
import {
    ArrowForwardIcon,
    CheckCircleIcon,
    CloseIcon,
    ErrorIcon,
    InfoIcon,
    WarningIcon
} from '@components/icons/material';
import { cn } from '@lib/utils';

type BbAlertVariant = 'default' | 'warning' | 'success' | 'error' | 'info';

interface BbAlertProps extends Omit<React.ComponentProps<typeof Alert>, 'variant' | 'title'> {
    title?: string;
    description?: React.ReactNode;
    showUpgradeButton?: boolean;
    upgradeButtonText?: string;
    onUpgradeClick?: () => void;
    /** Navigated to when the upgrade button is clicked and there's no `onUpgradeClick`. */
    upgradeButtonHref?: string;
    variant?: BbAlertVariant;
    showIcon?: boolean;
    icon?: React.ReactNode;
    showCloseButton?: boolean;
    onCloseClick?: () => void;
    titleClassName?: string;
    descriptionClassName?: string;
}

// bb-app variant names → design-system alert tints.
const ALERT_VARIANT = {
    default: 'default',
    warning: 'warning',
    success: 'success',
    error: 'destructive',
    info: 'info'
} as const;

const DEFAULT_ICON: Record<BbAlertVariant, React.ReactNode> = {
    default: <InfoIcon />,
    info: <InfoIcon />,
    warning: <WarningIcon />,
    success: <CheckCircleIcon />,
    error: <ErrorIcon />
};

/**
 * Design system v2 · Alert banner: tinted surface, 18px icon, bold title lead-in, optional
 * upgrade action (outline button) and dismiss ×.
 */
function BbAlert({
    children,
    title,
    description,
    showUpgradeButton = false,
    upgradeButtonText = 'Upgrade plan',
    onUpgradeClick,
    upgradeButtonHref,
    variant = 'default',
    showIcon = true,
    icon,
    className,
    showCloseButton = false,
    onCloseClick,
    titleClassName,
    descriptionClassName,
    ...props
}: BbAlertProps) {
    const router = useRouter();

    const handleUpgradeClick = () => {
        if (onUpgradeClick) onUpgradeClick();
        else if (upgradeButtonHref) router.push(upgradeButtonHref);
    };

    return (
        <Alert
            variant={ALERT_VARIANT[variant]}
            role={variant === 'error' || variant === 'warning' ? 'alert' : 'status'}
            className={cn('flex flex-wrap items-center gap-x-3 gap-y-2', className)}
            {...props}>
            <div className="flex min-w-0 flex-1 items-start gap-2">
                {(icon || showIcon) && (
                    <span aria-hidden className="shrink-0 [&_svg]:size-[1.125rem]">
                        {icon ?? DEFAULT_ICON[variant]}
                    </span>
                )}
                <div className="min-w-0 flex-1">
                    {title && (
                        <AlertTitle className={cn('line-clamp-none', titleClassName)}>
                            {title}
                        </AlertTitle>
                    )}
                    {description && (
                        <AlertDescription
                            className={cn(
                                variant === 'default' && title
                                    ? 'text-muted-foreground'
                                    : 'text-current',
                                descriptionClassName
                            )}>
                            {description}
                        </AlertDescription>
                    )}
                    {children}
                </div>
            </div>
            {showUpgradeButton && (
                <BbButton variant="secondary" size="sm" onClick={handleUpgradeClick}>
                    {upgradeButtonText}
                    <ArrowForwardIcon />
                </BbButton>
            )}
            {showCloseButton && (
                <BbButton
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Dismiss"
                    className="text-current hover:text-current"
                    onClick={onCloseClick}>
                    <CloseIcon />
                </BbButton>
            )}
        </Alert>
    );
}
BbAlert.displayName = 'BbAlert';

export { BbAlert };
export type { BbAlertProps };
