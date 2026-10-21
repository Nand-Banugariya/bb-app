import { Badge } from '@components/base_shadcn/badge';
import { env } from '@lib/env';
import { Environment } from '@lib/types';
import { cn } from '@lib/utils';

const LABELS: Partial<Record<string, { label: string; title: string; variant: 'info' | 'warning' | 'secondary' }>> = {
    [Environment.Local]: { label: 'Local', title: 'Local environment', variant: 'secondary' },
    [Environment.Development]: { label: 'Dev', title: 'Firefly (development)', variant: 'info' },
    [Environment.Staging]: { label: 'Staging', title: 'Dragonfly (staging)', variant: 'warning' }
};

interface EnvIconProps {
    className?: string;
}

/**
 * Environment badge next to the logo, so nobody mistakes a test environment for production.
 * Renders nothing in production. (bb-app used dev/stag PNGs; this is the design-system pill.)
 */
const EnvIcon = ({ className }: EnvIconProps) => {
    const current = LABELS[env.appEnv];
    if (!current) return null;
    return (
        <Badge variant={current.variant} size="sm" title={current.title} className={cn(className)}>
            {current.label}
        </Badge>
    );
};

export default EnvIcon;
