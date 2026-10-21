import { useState } from 'react';

/**
 * True once `value` has been true at any point since mount, and from then on.
 *
 * For loading states: `useLatch(!isLoading && rows.length > 0)` says real
 * content has been on screen, so a skeleton shown now is a refetch, and
 * `useLatch(isLoading)` says a skeleton has been, so content arriving now is
 * replacing it.
 */
export const useLatch = (value: boolean) => {
    const [latched, setLatched] = useState(value);
    // Set during render (not in an effect) so the latched value is already
    // right on the render that needs it.
    if (value && !latched) setLatched(true);
    return latched || value;
};
