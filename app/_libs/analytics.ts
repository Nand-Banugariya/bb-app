/**
 * Product analytics facade. bb-app calls PostHog directly (identify on login, capture
 * `login_successfull`, reset on logout). PostHog isn't installed in this project yet, so these
 * are no-ops: wire PostHog (or another provider) in here later and every call site lights up
 * without changes.
 */
type Props = Record<string, unknown>;

type Analytics = {
    /** posthog.identify(distinctId, props) */
    identify: (distinctId: string, props?: Props) => void;
    /** posthog.capture(event, props) */
    capture: (event: string, props?: Props) => void;
    /** posthog.reset() */
    reset: () => void;
};

const noop = () => {};

export const analytics: Analytics = {
    identify: noop,
    capture: noop,
    reset: noop
};
