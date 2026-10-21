/* eslint-disable @typescript-eslint/no-explicit-any -- ported from bb-app as-is; typed when its feature moves over */
import { fetch } from '@lib/axiosConfig';
import { ProjectIntegrationSuccessResponse } from '../slices/projectIntegration';
import { ConnectPayload } from '../models/integration';
import { removeEmpty } from '@lib/helpers';
import type { WorkspaceSuccessResponse } from '../models/workspace';

export const getIntegrationsByProjectId = async ({
    projectId,
    workspaceId
}: {
    projectId: string | string[];
    workspaceId: string;
}): Promise<ProjectIntegrationSuccessResponse> => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/integration`,
        method: 'GET'
    });
};

export const fetchConnectionDetailsAPI = async (
    payload: ConnectPayload,
    path: string,
    projectId: string,
    workspaceId: string,
    bbVersion?: string,
    location?: string
) => {
    return fetch({
        url: projectId
            ? `/workspace/${workspaceId}/project/${projectId}/${path}/connect`
            : `/workspace/${workspaceId}/${path}/connect`,
        method: 'POST',
        data: payload,
        headers: removeEmpty({
            BB_VERSION: bbVersion || process?.env?.BB_VERSION
        })
    });
};

export const getSentryProjectsAPI = async (projectId: string, workspaceId: string) => {
    return fetch({
        url: `/workspace/${workspaceId}/${projectId ? `project/${projectId}/` : ''}sentry/projects`,
        method: 'GET'
    });
};

export const getSentryEventsAPI = async (
    payload: {
        projectId: string;
        start: string;
        end: string;
        search?: string;
    },
    projectId: string,
    workspaceId: string
) => {
    return fetch({
        url: `/workspace/${workspaceId}/${
            projectId ? `project/${projectId}/` : ''
        }sentry/get-issues`,
        method: 'POST',
        data: payload
    });
};

export const disconnectAPI = async (url: string) => {
    return fetch({
        url,
        method: 'DELETE'
    });
};

export const getWorkspaceIntegrationsAPI = async ({
    workspaceId
}: {
    workspaceId: string | string[];
}): Promise<any> => {
    return fetch({
        url: `/workspace/${workspaceId}/integrations`,
        method: 'GET'
    });
};

export const getConnectedProjectsForIntegrationAPI = async ({
    workspaceId
}: {
    workspaceId: string | string[];
}): Promise<any> => {
    return fetch({
        url: `/workspace/${workspaceId}/connected-projects`,
        method: 'GET'
    });
};

export const getProjectIntegrationsAPI = async ({
    workspaceId,
    projectId
}: {
    workspaceId: string | string[];
    projectId: string;
}): Promise<any> => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/integration`,
        method: 'GET'
    });
};

export const excludeProjectsFromIntegrationAPI = async ({
    workspaceId,
    integrationKey,
    workspaceHasUserIntegrationId,
    excludedProjectIds
}: {
    workspaceId: string | string[];
    integrationKey: string;
    workspaceHasUserIntegrationId: string;
    excludedProjectIds: string[];
}): Promise<WorkspaceSuccessResponse> => {
    return fetch({
        url: `/workspace/${workspaceId}/${integrationKey}/${workspaceHasUserIntegrationId}/exclude-project`,
        method: 'PATCH',
        data: { excludedProjectIds }
    });
};

export const connectWorkspaceIntegrationAPI = async ({
    workspaceId,
    integrationKey
}: {
    workspaceId: string | string[];
    integrationKey: string;
}): Promise<WorkspaceSuccessResponse> => {
    return fetch({
        url: `/workspace/${workspaceId}/${integrationKey}/connect-to-workspace`,
        method: 'GET'
    });
};

export const disconnectWorkspaceIntegrationAPI = async ({
    workspaceId,
    integrationKey
}: {
    workspaceId: string | string[];
    integrationKey: string;
}): Promise<WorkspaceSuccessResponse> => {
    return fetch({
        url: `/workspace/${workspaceId}/${integrationKey}/disconnect`,
        method: 'DELETE'
    });
};

// One project's own connection (not the workspace one it may inherit).
export const disconnectProjectIntegrationAPI = async ({
    workspaceId,
    projectId,
    integrationKey
}: {
    workspaceId: string;
    projectId: string;
    integrationKey: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/${integrationKey}/disconnect`,
        method: 'DELETE'
    });
};

// Every project with its own connection to `integration` (any member's), with
// that connection's row. The integrations list only carries workspace rows,
// and `connectedProjects` only the caller's own.
export const getProjectConnectionsAPI = async ({
    workspaceId,
    integration
}: {
    workspaceId: string;
    integration: any;
}): Promise<{ projectId: string; row: any }[]> => {
    const projects: any[] = await fetch({
        url: `/workspace/${workspaceId}/integration/${integration.name}/projects`,
        method: 'GET'
    });
    return (Array.isArray(projects) ? projects : []).flatMap((project: any) => {
        const row = project?.integration?.workspaceHasUserIntegration?.find(
            (r: any) => r?.projectId === project.id
        );
        return row ? [{ projectId: project.id, row }] : [];
    });
};

// Disconnects a shared integration (Sentry, CloudWatch, Intercom) everywhere,
// whoever connected it. Sentry/CloudWatch: `disconnect-all`, which for these
// removes the workspace and every project connection (workspace admins only).
// Intercom has no workspace route, and only its per-project route uninstalls
// the app, so each project is disconnected on its own. Every project is tried;
// the first failure is thrown afterwards. `canManageProject`, when given,
// is checked for every project first, so nothing changes if one is refused.
export const disconnectSharedIntegrationAPI = async ({
    workspaceId,
    integration,
    canManageProject
}: {
    workspaceId: string;
    integration: any;
    canManageProject?: (projectId: string, row: any) => boolean;
}) => {
    if (integration.key !== 'intercom') {
        try {
            await fetch({
                url: `workspace/${workspaceId}/integrations/${integration.name}/disconnect-all`,
                method: 'DELETE'
            });
        } catch (error: any) {
            // 404: nothing was connected, so it's already disconnected.
            if (error?.responseStatus !== 404) throw error;
        }
        return { status: 'success' };
    }

    const connections = await getProjectConnectionsAPI({ workspaceId, integration });
    if (canManageProject && connections.some((c) => !canManageProject(c.projectId, c.row))) {
        const refused: any = new Error('Not allowed to disconnect every project');
        refused.responseStatus = 403;
        refused.responseData = { errorCode: 'ROLE_NOT_ALLOWED' };
        throw refused;
    }
    // A project with nothing left answers 200 { status: 'error' }: already
    // disconnected, so only a thrown error counts as a failure.
    const results = await Promise.allSettled(
        connections.map((c) =>
            disconnectProjectIntegrationAPI({
                workspaceId,
                projectId: c.projectId,
                integrationKey: integration.key
            })
        )
    );
    const failed = results.find((r): r is PromiseRejectedResult => r.status === 'rejected');
    if (failed) throw failed.reason;
    return { status: 'success' };
};

export const createWorkspaceAutomationAPI = async ({
    workspaceId,
    projectId,
    workspaceHasUserIntegrationId,
    payload,
    preference
}: {
    workspaceId: string;
    projectId: string | undefined;
    workspaceHasUserIntegrationId: string;
    payload: any;
    preference: any;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}/${
            projectId ? `project/${projectId}/` : ''
        }integration/${workspaceHasUserIntegrationId}/automation`,
        method: 'POST',
        data: { configuration: payload, preference }
    });
};

export const deletesWorkspaceAutomationAPI = async ({
    workspaceId,
    projectId,
    workspaceHasUserIntegrationId
}: {
    workspaceId: string;
    projectId: string | undefined;
    workspaceHasUserIntegrationId: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}/${
            projectId ? `project/${projectId}/` : ''
        }integration/${workspaceHasUserIntegrationId}/automation`,
        method: 'DELETE'
    });
};

export const excludeProjectsFromAutomationAPI = async ({
    workspaceId,
    workspaceHasUserAutomationId,
    excludedProjectIds
}: {
    workspaceId: string | string[];
    workspaceHasUserAutomationId: string;
    excludedProjectIds: string[];
}): Promise<WorkspaceSuccessResponse> => {
    return fetch({
        url: `/workspace/${workspaceId}/automation/${workspaceHasUserAutomationId}/exclude-project`,
        method: 'PATCH',
        data: { excludedProjectIds }
    });
};

export const verifyUrlAPI = async (url: string, workspaceId: string, projectId?: string) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/webhook/test-connection`,
        method: 'POST',
        data: { url }
    });
};
export const updateBugasuraAPI = async (
    payload: any,
    workspaceId: string,
    bugasuraId: string,
    projectId?: string
) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/bugasura/update-api-key`,
        method: 'PATCH',
        data: payload
    });
};
export const connectBugasuraAPI = async (payload: any, workspaceId: string, projectId?: string) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/bugasura/connect`,
        method: 'POST',
        data: payload
    });
};
export const disconnectBugasuraAPI = async (
    workspaceId: string,
    bugasuraId: string,
    projectId?: string
) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/bugasura/disconnect`,
        method: 'DELETE'
    });
};

// ProofHub API functions
export const updateProofHubAPI = async (
    payload: any,
    workspaceId: string,
    proofhubId: string,
    projectId?: string
) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/proofhub/update-api-key`,
        method: 'PATCH',
        data: payload
    });
};

export const connectProofHubAPI = async (payload: any, workspaceId: string, projectId?: string) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/proofhub/connect`,
        method: 'POST',
        data: payload
    });
};

export const disconnectProofHubAPI = async (
    workspaceId: string,
    proofhubId: string,
    projectId?: string
) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/proofhub/disconnect`,
        method: 'DELETE'
    });
};
// Every webhook in the workspace, project-scoped ones included, newest first,
// each with its creator (`user`) and project. Always an array.
export const listWebhooksAPI = async (workspaceId: string): Promise<any[]> => {
    const response: any = await fetch({
        url: `/workspace/${workspaceId}/webhook`,
        method: 'GET',
        params: { includeProjects: true }
    });
    return Array.isArray(response) ? response : response?.list || [];
};

// How many webhooks `listWebhooksAPI` would return to this user, without
// loading them. 403 when the plan doesn't include webhooks.
export const countWebhooksAPI = async (workspaceId: string): Promise<number> => {
    const response: any = await fetch({
        url: `/workspace/${workspaceId}/webhook/count`,
        method: 'GET'
    });
    return typeof response?.count === 'number' ? response.count : 0;
};

export const createWebhookAPI = async (payload: any, workspaceId: string) => {
    return fetch({
        url: `/workspace/${workspaceId}/webhook`,
        method: 'POST',
        data: payload
    });
};

export const updateWebhookAPI = async (payload: any, workspaceId: string, webhookId: string) => {
    return fetch({
        url: `/workspace/${workspaceId}/webhook/${webhookId}`,
        method: 'PATCH',
        data: payload
    });
};

export const deleteWebhookAPI = async (
    workspaceId: string,
    webhookId: string,
    projectId?: string
) => {
    return fetch({
        url: `/workspace/${workspaceId}/webhook/${webhookId}`,
        method: 'DELETE'
    });
};

export const connectGitLabSelfHostedAPI = (
    workspaceId: string,
    projectId: string | undefined,
    payload: {
        selfHostUrl: string;
        clientId: string;
        clientSecret: string;
    }
) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/gitlab/self-hosted`,
        method: 'POST',
        data: payload
    });
};

export const checkIntercomConnectionAPI = async (workspaceId: string) => {
    return fetch({
        url: `/workspace/${workspaceId}/intercom/is-connected-to-another-project`,
        method: 'GET'
    });
};

export const connectCloudWatchAPI = async (payload: any) => {
    const { workspaceId, projectId, awsAccountId } = payload;
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/cloudwatch/connect`,
        method: 'POST',
        data: { awsAccountId, projectId }
    });
};

export const checkCloudWatchConnectionAPI = async (payload: any) => {
    const { workspaceId, projectId } = payload;
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/cloudwatch/check-connection`,
        method: 'POST'
    });
};

export const getCloudwatchRegionsAPI = async (
    workspaceId: string,
    search: string,
    projectId: string
) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/cloudwatch/regions?searchTerm=${search}`,
        method: 'GET'
    });
};

export const getCloudwatchLogGroupsAPI = async (
    workspaceId: string,
    region: string,
    search: string,
    projectId: string
) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/cloudwatch/log-groups?region=${region}&searchTerm=${search}`,
        method: 'GET'
    });
};

export const fetchCloudwatchLogsAPI = async (payload: any) => {
    const { workspaceId, projectId, region, logGroupNames, start, end, search, level, nextTokens } =
        payload;
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/cloudwatch/log-events`,
        method: 'POST',
        data: removeEmpty({
            region,
            logGroupNames,
            start,
            end,
            search,
            level,
            nextTokens
        })
    });
};

// Saved per project (the bug's project), whichever connection serves it.
export const getCloudwatchLogSettingsAPI = async (workspaceId: string, projectId: string) => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/cloudwatch/settings`,
        method: 'GET'
    });
};

export const saveCloudwatchLogSettingsAPI = async (payload: {
    workspaceId: string;
    projectId: string;
    region: string;
    logGroupNames: string[];
    timeRange: number;
}) => {
    const { workspaceId, projectId, region, logGroupNames, timeRange } = payload;
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/cloudwatch/settings`,
        method: 'PUT',
        data: { region, logGroupNames, timeRange }
    });
};
