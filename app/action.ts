'use server';

import { cookies } from 'next/headers';

type CookieOptions = Parameters<Awaited<ReturnType<typeof cookies>>['set']>[2];

/** Sets a cookie from a Server Action / Route Handler (Next only allows writes there). */
export async function createCookie(key: string, value: string, cookie?: CookieOptions) {
    (await cookies()).set(key, value, cookie);
}

/** Reads a JSON cookie (e.g. `auth`). Returns the raw string when it isn't JSON. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function readCookie(key: string): Promise<any> {
    const cookieValue = (await cookies()).get(key)?.value;
    if (!cookieValue) return cookieValue;
    try {
        return JSON.parse(cookieValue);
    } catch {
        return cookieValue;
    }
}

export async function deleteCookie(key: string) {
    (await cookies()).delete(key);
}
