import { ExtensionIcon, PlayCircleIcon, VideocamIcon } from '@components/icons/material';

/**
 * Right pane during workspace onboarding. bb-app played an "pin the extension" video
 * (public/videos/extension-pin.mp4); until that asset is brought over, this shows the same
 * message as a design-system illustration: the extension pinned in a browser toolbar.
 */
const WorkspaceOnboardingAnimation = () => (
    <div className="flex w-full max-w-md flex-col items-center gap-8 text-center">
        <div
            aria-hidden
            className="flex w-full flex-col overflow-hidden rounded-lg bg-card shadow-sh-lg">
            <div className="flex items-center gap-2 border-b border-d200 px-3 py-2.5">
                <span className="size-2.5 rounded-full bg-d300" />
                <span className="size-2.5 rounded-full bg-d300" />
                <span className="size-2.5 rounded-full bg-d300" />
                <span className="ml-2 h-6 flex-1 rounded-md bg-d100" />
                <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground motion-safe:animate-pulse-sk [&_svg]:size-4">
                    <ExtensionIcon />
                </span>
            </div>
            <div className="flex flex-col gap-3 p-5">
                <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-spot text-success [&_svg]:size-5">
                        <VideocamIcon />
                    </span>
                    <div className="flex flex-1 flex-col gap-2">
                        <span className="h-3 w-2/5 rounded-md bg-sk" />
                        <span className="h-2.5 w-3/5 rounded-md bg-d100" />
                    </div>
                </div>
                <div className="flex h-28 items-center justify-center rounded-md bg-canvas text-muted-foreground [&_svg]:size-8">
                    <PlayCircleIcon />
                </div>
            </div>
        </div>
        <div className="flex flex-col gap-1.5">
            <p className="text-lg font-semibold tracking-tight text-foreground">
                Pin BetterBugs to your toolbar
            </p>
            <p className="text-md text-muted-foreground">
                Record your screen or grab a screenshot in one click, from any tab.
            </p>
        </div>
    </div>
);

export default WorkspaceOnboardingAnimation;
