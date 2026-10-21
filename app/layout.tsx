import type { Metadata, Viewport } from 'next';
import { Google_Sans, Google_Sans_Code } from 'next/font/google';
import { Toaster } from '@components/base_shadcn/sonner';
import { BBTooltipProvider } from '@components/base_shadcn/custom/bbtooltip';
import { ThemeProvider } from '@components/contexts/themeContext';
import { AppProviders } from '@components/providers/appProviders';
import { THEME_INIT_SCRIPT } from '@lib/themeInit';
import './globals.css';

// One font for everything (design system v2), exposed to globals.css as --font-google-sans.
const googleSans = Google_Sans({
    variable: '--font-google-sans',
    subsets: ['latin', 'latin-ext'],
    display: 'swap',
    // next/font has no metrics for Google Sans, so it can't generate a size-adjusted fallback.
    adjustFontFallback: false,
    fallback: ['system-ui', 'sans-serif']
});

// Monospace for code, URLs, IDs and step tags (Login v2), exposed as --font-google-sans-code.
const googleSansCode = Google_Sans_Code({
    variable: '--font-google-sans-code',
    subsets: ['latin'],
    display: 'swap',
    adjustFontFallback: false,
    fallback: ['ui-monospace', 'monospace']
});

export const metadata: Metadata = {
    title: { template: '%s · BetterBugs', default: 'BetterBugs' },
    description: 'Report bugs in one click.'
};

export const viewport: Viewport = {
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#ffffff' },
        { media: '(prefers-color-scheme: dark)', color: '#09090b' }
    ],
    viewportFit: 'cover'
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
    return (
        // The theme class is set by THEME_INIT_SCRIPT before paint, so React must not fight it.
        <html
            lang="en"
            className={`${googleSans.variable} ${googleSansCode.variable} h-full`}
            suppressHydrationWarning>
            <head>
                <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
            </head>
            <body className="flex min-h-full flex-col">
                <AppProviders>
                    <ThemeProvider>
                        <BBTooltipProvider>{children}</BBTooltipProvider>
                        <Toaster />
                    </ThemeProvider>
                </AppProviders>
            </body>
        </html>
    );
}
