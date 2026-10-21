'use client';

import NextImage, { ImageProps } from 'next/image';
import React, { useState } from 'react';

export type SafeImageProps = Omit<ImageProps, 'src' | 'alt'> & {
    /** Tolerates the empty string a missing storage key resolves to. */
    src?: ImageProps['src'] | null;
    alt?: string;
    /** Rendered in place of the image when `src` is empty or fails to load. */
    fallback?: React.ReactNode;
};

/**
 * Drop-in replacement for `next/image` that never leaves a broken image behind.
 *
 * A stored image key can stop resolving for reasons that are nobody's fault —
 * an object removed from the bucket, a social photo whose provider URL rotated,
 * a half-finished upload — and `next/image` renders those as a broken-image
 * icon. Here an empty or failing `src` renders `fallback` instead (nothing, by
 * default), so a bad image degrades to a gap rather than visible breakage.
 *
 * Because the props are a superset of `next/image`'s, adopting it is an import
 * swap: `import Image from '@components/reusable/safeImage'`.
 */
const SafeImage = ({ src, alt = '', fallback = null, onError, ...rest }: SafeImageProps) => {
    // Remember which src failed, so a new src gets a fresh attempt (a list row reused for a
    // different user, say) without resetting state in an effect.
    const [failedSrc, setFailedSrc] = useState<SafeImageProps['src']>(null);

    if (!src || failedSrc === src) {
        return <>{fallback}</>;
    }

    return (
        <NextImage
            {...rest}
            src={src}
            alt={alt}
            onError={(event) => {
                setFailedSrc(src);
                onError?.(event);
            }}
        />
    );
};

export default SafeImage;
