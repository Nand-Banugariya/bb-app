'use client';

import RouteError, { type RouteErrorProps } from '@components/reusable/routeError';

const Error = (props: RouteErrorProps) => (
    <RouteError {...props} description="the onboarding page" isFullScreen />
);

export default Error;
