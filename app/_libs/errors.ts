/**
 * Text for an error toast or inline error: the API's own message when it
 * explained a 4xx ("You don't have access to this project"), otherwise
 * `fallback`. Never "Network Error", a status line, or "Bad response from
 * server". Errors come from `fetch` in axiosConfig, which sets
 * `responseStatus` / `responseData` when the API answered.
 */
export const toUserMessage = (error: unknown, fallback: string): string => {
    const status = (error as { responseStatus?: unknown } | null)?.responseStatus;
    const data = (error as { responseData?: { message?: unknown } } | null)?.responseData;
    if (typeof status === 'number' && status >= 400 && status < 500) {
        const message = Array.isArray(data?.message) ? data?.message[0] : data?.message;
        if (typeof message === 'string' && message.trim()) return message.trim();
    }
    return fallback;
};
