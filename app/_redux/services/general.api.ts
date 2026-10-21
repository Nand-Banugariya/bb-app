/* eslint-disable @typescript-eslint/no-explicit-any -- ported from bb-app as-is; typed when its feature moves over */
import { fetch } from '@lib/axiosConfig';

export const uploadBugFileAPI = async ({
    bugId,
    payload,
    signal
}: {
    bugId: string;
    payload: FormData;
    signal?: any;
}) => {
    return fetch({
        url: `/upload/upload-bug-files/${bugId}`,
        method: 'POST',
        data: payload,
        signal,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};
