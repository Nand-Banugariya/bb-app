import { fetch } from '@lib/axiosConfig';
import {
    GettingStartedAction,
    GettingStartedStatus,
    GettingStartedStepKey
} from '../slices/gettingStarted';

export const getGettingStartedAPI = async ({
    workspaceId
}: {
    workspaceId: string | string[];
}): Promise<GettingStartedStatus> => {
    return fetch({
        url: `/workspace/${workspaceId}/getting-started`,
        method: 'GET'
    });
};

// Skip / unskip a step, or hide the checklist. Returns the refreshed status.
export const updateGettingStartedAPI = async ({
    workspaceId,
    action,
    step
}: {
    workspaceId: string | string[];
    action: GettingStartedAction;
    step?: GettingStartedStepKey;
}): Promise<GettingStartedStatus> => {
    return fetch({
        url: `/workspace/${workspaceId}/getting-started`,
        method: 'PATCH',
        data: { action, step }
    });
};
