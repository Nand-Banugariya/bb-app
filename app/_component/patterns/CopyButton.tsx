'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { CheckIcon, ContentCopyIcon } from '@components/icons/material';
import BbButton, { type BbButtonProps } from '@components/base_shadcn/custom/bbbutton';
import { BBTooltip } from '@components/base_shadcn/custom/bbtooltip';

interface CopyButtonProps extends Omit<BbButtonProps, 'onClick' | 'children' | 'value'> {
    /** Text to copy, or a function that returns it (may be async). */
    value: string | (() => string | Promise<string>);
    /** Accessible name / tooltip, e.g. "Copy link". */
    label?: string;
    /** Show the label next to the icon instead of icon-only. */
    showLabel?: boolean;
    /** Toast after copying (past tense, e.g. "Link copied"). Off by default. */
    toastMessage?: string;
    onCopied?: () => void;
}

const copyText = async (text: string) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        // Fallback for non-secure contexts / denied permission.
        const area = document.createElement('textarea');
        area.value = text;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(area);
        return ok;
    }
};

/**
 * Copy-to-clipboard button: the icon turns into a green check for 1.5s. Icon-only by
 * default (with an aria-label and tooltip).
 */
const CopyButton = ({
    value,
    label = 'Copy',
    showLabel = false,
    toastMessage,
    onCopied,
    variant = 'ghost',
    size,
    ...props
}: CopyButtonProps) => {
    const [copied, setCopied] = React.useState(false);
    const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined);

    React.useEffect(() => () => clearTimeout(timer.current), []);

    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const text = typeof value === 'function' ? await value() : value;
        const ok = await copyText(text);
        if (!ok) {
            toast.error('Couldn’t copy. Select the text and copy it manually.');
            return;
        }
        setCopied(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), 1500);
        if (toastMessage) toast.success(toastMessage);
        onCopied?.();
    };

    const button = (
        <BbButton
            variant={variant}
            size={size ?? (showLabel ? 'sm' : 'icon-sm')}
            aria-label={showLabel ? undefined : label}
            onClick={handleCopy}
            {...props}>
            {copied ? <CheckIcon className="text-success" /> : <ContentCopyIcon />}
            {showLabel && <span>{copied ? 'Copied' : label}</span>}
            <span className="sr-only" aria-live="polite">
                {copied ? 'Copied' : ''}
            </span>
        </BbButton>
    );

    return showLabel ? button : <BBTooltip content={copied ? 'Copied' : label}>{button}</BBTooltip>;
};

export { CopyButton, copyText };
export type { CopyButtonProps };
