import { fetch } from '@lib/axiosConfig';
import { SessionDetailsObject } from '../slices/sessionDetails';

export const getSessionDetailsAPI = async ({
    bugId,
    inviteToken
}: {
    bugId: string;
    inviteToken?: string;
}): Promise<SessionDetailsObject> => {
    if (inviteToken) {
        return fetch({
            url: `/bug/${bugId}?inviteToken=${inviteToken}`,
            method: 'GET'
        });
    } else
        return fetch({
            url: `/bug/${bugId}`,
            method: 'GET'
        });
};

export const getSessionLogsAPI = async ({
    bugId
}: {
    bugId: string;
    inviteToken?: string;
}): Promise<SessionDetailsObject> => {
    return fetch({
        url: `/bug/${bugId}/logs`,
        method: 'GET'
    });
};

// export const getNetworkLogsAPI = async ({
//     projectId,
//     bugId
// }: {
//     projectId: string | string[];
//     bugId: string | string[];
// }): Promise<any> => {
//     return fetch({
//         url: `/project/${projectId}/bug/${bugId}/network`,
//         method: 'GET'
//     });
// };

// export const getConsoleLogsAPI = async ({
//     projectId,
//     bugId
// }: {
//     projectId: string | string[];
//     bugId: string | string[];
// }): Promise<any> => {
//     return fetch({
//         url: `/project/${projectId}/bug/${bugId}/console`,
//         method: 'GET'
//     });
// };
