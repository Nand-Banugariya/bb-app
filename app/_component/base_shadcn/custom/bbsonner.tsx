'use client';

import * as React from 'react';
import { Toaster } from '../sonner';

type BBSonnerProps = React.ComponentProps<typeof Toaster>;

/**
 * The app's only toaster (design system v2: inverted surface in both themes, status icon,
 * action in primary green). Already mounted in app/layout.tsx — don't mount a second one.
 * Copy rules: past tense, no "!", no "successfully"; errors say what failed and what to do next.
 */
const BBSonner = (props: BBSonnerProps) => <Toaster {...props} />;
BBSonner.displayName = 'BBSonner';

export { BBSonner };
export type { BBSonnerProps };
