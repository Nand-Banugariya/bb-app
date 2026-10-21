'use client';

import React, { useEffect, useState } from 'react';
import { CheckIcon, ContentCopyIcon } from '@components/icons/material';
import BbButton from '@components/base_shadcn/custom/bbbutton';
import { cn } from '@lib/utils';

interface CopyToClipboardProps {
    text: string;
    className?: string;
    /** What's being copied, for the button's name ("Copy URL"). */
    label?: string;
}

/** Icon button that copies `text`; the icon turns into a green check for a moment. */
const CopyToClipboard = ({ text, className, label = 'Copy' }: CopyToClipboardProps) => {
    const [clicked, setClicked] = useState(false);
    useEffect(() => {
        if (!clicked) return;
        const timeout = setTimeout(() => setClicked(false), 2000);
        return () => clearTimeout(timeout);
    }, [clicked]);
    return (
        <BbButton
            variant="ghost"
            size="icon-sm"
            aria-label={clicked ? 'Copied' : label}
            title={clicked ? 'Copied' : label}
            className={cn(className)}
            onClick={async (e) => {
                e.stopPropagation();
                try {
                    await navigator.clipboard.writeText(text ?? '');
                    setClicked(true);
                } catch {
                    // Clipboard blocked: nothing to confirm.
                }
            }}>
            {clicked ? (
                <CheckIcon className="size-4 text-success" />
            ) : (
                <ContentCopyIcon className="size-4" />
            )}
        </BbButton>
    );
};

export default CopyToClipboard;
export type { CopyToClipboardProps };
