/* eslint-disable @typescript-eslint/no-explicit-any -- ported from bb-app as-is; typed when its feature moves over */
import { fetch } from '@lib/axiosConfig';

import {
    BasicPayload,
    ClickUpSpaceIdObject,
    CreatePlatformTaskAPIObject,
    GitHubPayload,
    ProjectIdAsParams
} from '../models/integration';

export const getPlatformMetaDataAPI = ({
    workspaceId,
    projectId,
    path
}: {
    workspaceId: string;
    projectId?: string;
    path: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${projectId ? `/project/${projectId}` : ''}/${path}/teams`,
        method: 'GET'
    });
};

export const createPlatformTaskAPI = ({
    workspaceId,
    projectId,
    payload,
    path,
    siteURL
}: CreatePlatformTaskAPIObject) => {
    return fetch({
        url: `/workspace/${workspaceId}${projectId ? `/project/${projectId}` : ''}/${path}/task${
            siteURL ? `?resourceId=${siteURL}` : ''
        }`,
        method: 'POST',
        data: payload
    });
};

export const getAzureOrganizationsAPI = ({
    workspaceId,
    projectId
}: {
    workspaceId: string;
    projectId?: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/azure-boards/organizations`,
        method: 'GET'
    });
};

export const getAzureProjectsAPI = ({
    workspaceId,
    projectId,
    azureOrganization
}: {
    workspaceId: string;
    projectId?: string;
    azureOrganization: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/azure-boards/${azureOrganization}/projects`,
        method: 'GET'
    });
};

export const getAzureWorkItemTypeAPI = ({
    workspaceId,
    projectId,
    azureOrganization,
    azureProject
}: {
    workspaceId: string;
    projectId?: string;
    azureOrganization: string;
    azureProject: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/azure-boards/${azureOrganization}/${azureProject}/work-item-types`,
        method: 'GET'
    });
};

export const getAzureWorkItemTypeFieldsAPI = ({
    workspaceId,
    projectId,
    azureOrganization,
    azureProject,
    azureWorkItemType
}: {
    workspaceId: string;
    projectId?: string;
    azureOrganization: string;
    azureProject: string;
    azureWorkItemType: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/azure-boards/${azureOrganization}/${azureProject}/work-item-types/${azureWorkItemType}/fields`,
        method: 'GET'
    });
};

export const getAzureTagsAPI = ({
    workspaceId,
    projectId,
    azureOrganization,
    azureProject
}: {
    workspaceId: string;
    projectId?: string;
    azureOrganization: string;
    azureProject: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/azure-boards/${azureOrganization}/${azureProject}/tags`,
        method: 'GET'
    });
};

export const getAzureTeamsAPI = ({
    workspaceId,
    projectId,
    azureOrganization,
    azureProject
}: {
    workspaceId: string;
    projectId?: string;
    azureOrganization: string;
    azureProject: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/azure-boards/${azureOrganization}/${azureProject}/teams`,
        method: 'GET'
    });
};

export const getAzureUsersAPI = ({
    workspaceId,
    projectId,
    azureOrganization,
    azureProject,
    azureTeam
}: {
    workspaceId: string;
    projectId?: string;
    azureOrganization: string;
    azureProject: string;
    azureTeam: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/azure-boards/${azureOrganization}/${azureProject}/${azureTeam}/members`,
        method: 'GET'
    });
};

export const getAllAzureUsersAPI = ({
    workspaceId,
    projectId,
    azureOrganization
}: {
    workspaceId: string;
    projectId?: string;
    azureOrganization: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/azure-boards/${azureOrganization}/get-all-members`,
        method: 'GET'
    });
};

export const getClickUpWorkspaceAPI = ({ workspaceId, projectId }: ProjectIdAsParams) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/click-up/workspace`,
        method: 'GET'
    });
};

export const getClickUpSpaceByWorkspaceIdAPI = ({
    workspaceId,
    projectId,
    clickUpWorkspaceId
}: {
    workspaceId: string;
    projectId?: string;
    clickUpWorkspaceId: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/click-up/workspace/${clickUpWorkspaceId}/space`,
        method: 'GET'
    });
};

export const getClickUpSpaceFolderBySpaceIdAPI = ({
    workspaceId,
    projectId,
    spaceId
}: ClickUpSpaceIdObject) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/click-up/space/${spaceId}/folder`,
        method: 'GET'
    });
};

export const getClickUpAssigneeByFolderIdAPI = ({
    workspaceId,
    projectId,
    folderId
}: {
    workspaceId: string;
    projectId?: string;
    folderId: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/click-up/folder/${folderId}/assignee`,
        method: 'GET'
    });
};

export const getClickUpAssigneeByListIdAPI = ({
    workspaceId,
    projectId,
    listId
}: {
    workspaceId: string;
    projectId?: string;
    listId: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/click-up/list/${listId}/assignee`,
        method: 'GET'
    });
};

export const getClickUpParentTaskByListIdAPI = ({
    workspaceId,
    projectId,
    listId
}: {
    workspaceId: string;
    projectId?: string;
    listId: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/click-up/list/${listId}/task`,
        method: 'GET'
    });
};

export const getClickUpTaskTypeAPI = ({
    workspaceId,
    projectId
}: {
    workspaceId: string;
    projectId?: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/click-up/task/type`,
        method: 'GET'
    });
};

export const getClickUpSpaceListBySpaceIdAPI = ({
    workspaceId,
    projectId,
    spaceId
}: ClickUpSpaceIdObject) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/click-up/space/${spaceId}/list`,
        method: 'GET'
    });
};

export const getJiraProjectsAPI = ({ workspaceId, projectId, siteURL }: ProjectIdAsParams) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/jira/projects?resourceId=${siteURL}`,
        method: 'GET'
    });
};
export const getAllJiraSitesAPI = ({
    workspaceId,
    projectId
}: {
    workspaceId: string;
    projectId?: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/jira/accessible-resources`,
        method: 'GET'
    });
};

export const getAllJiraProjectsAPI = ({
    workspaceId,
    projectId,
    siteURL
}: {
    workspaceId: string;
    projectId?: string;
    siteURL?: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/jira/all-projects?resourceId=${siteURL}`,
        method: 'GET'
    });
};

export const getJiraIssueTypesMetaDataByProjectIdAPI = ({
    workspaceId,
    projectId,
    jiraProjectId,
    siteURL
}: {
    workspaceId: string;
    projectId?: string;
    jiraProjectId: string;
    siteURL?: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/jira/meta-data/${jiraProjectId}?resourceId=${siteURL}`,
        method: 'GET'
    });
};

export const getJiraFieldsMetaDataByIssueTypeIdAPI = ({
    workspaceId,
    projectId,
    jiraProjectId,
    jiraIssueTypeId,
    siteURL
}: {
    workspaceId: string;
    projectId?: string;
    jiraProjectId: string;
    jiraIssueTypeId: string;
    siteURL?: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/jira/meta-data/${jiraProjectId}/${jiraIssueTypeId}?resourceId=${siteURL}`,
        method: 'GET'
    });
};

export const getJiraLabelsAPI = ({ workspaceId, projectId, siteURL }: ProjectIdAsParams) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/jira/label?resourceId=${siteURL}`,
        method: 'GET'
    });
};

export const getJiraIssuesAPI = ({
    workspaceId,
    projectId,
    siteURL,
    searchQuery,
    jiraProjectId
}: {
    workspaceId: string;
    projectId?: string;
    siteURL?: string;
    jiraProjectId?: string;
    searchQuery?: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/jira/search-linkable-issues?resourceId=${siteURL}${
            searchQuery ? `&query=${searchQuery}` : ''
        }&jiraProject=${jiraProjectId}&maxResults=25`,
        method: 'GET'
    });
};

export const getJiraBoardAPI = ({
    workspaceId,
    projectId,
    siteURL,
    jiraProjectId
}: {
    workspaceId: string;
    projectId?: string;
    siteURL?: string;
    jiraProjectId?: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/jira/boards/${jiraProjectId}?resourceId=${siteURL}`,
        method: 'GET'
    });
};

export const getJiraSprintsAPI = ({
    workspaceId,
    projectId,
    siteURL,
    boardId
}: {
    workspaceId: string;
    projectId?: string;
    siteURL?: string;
    boardId?: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/jira/boards/${boardId}/sprints?resourceId=${siteURL}`,
        method: 'GET'
    });
};

export const getJiraAssigneeByProjectIdAPI = ({
    workspaceId,
    projectId,
    jiraProjectId,
    siteURL
}: {
    workspaceId: string;
    projectId?: string;
    jiraProjectId: string;
    siteURL?: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/jira/projects/${jiraProjectId}/assignee?resourceId=${siteURL}`,
        method: 'GET'
    });
};

export const getNotionDatabasesAPI = ({
    workspaceId,
    projectId
}: {
    workspaceId: string;
    projectId?: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/notion/databases`,
        method: 'GET'
    });
};

export const getNotionAssigneeByDatabaseIdAPI = ({
    workspaceId,
    projectId
}: {
    workspaceId: string;
    projectId?: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/notion/assignees`,
        method: 'GET'
    });
};

export const getNotionUsersAPI = ({
    workspaceId,
    projectId
}: {
    workspaceId: string;
    projectId?: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/notion/assignees`,
        method: 'GET'
    });
};

export const getAsanaMetaDataAPI = ({
    workspaceId,
    projectId
}: {
    workspaceId: string;
    projectId?: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${projectId ? `/project/${projectId}` : ''}/asana/project`,
        method: 'GET'
    });
};

export const getSectionsAndParentTasksByProjectIdAPI = ({
    workspaceId,
    projectId,
    asanaProjectId
}: {
    workspaceId: string;
    projectId?: string;
    asanaProjectId: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/asana/project/${asanaProjectId}/sections`,
        method: 'GET'
    });
};

export const getGitHubRepositoriesAPI = ({
    workspaceId,
    projectId
}: {
    workspaceId: string;
    projectId?: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/github/repositories`,
        method: 'GET'
    });
};

export const getGitLabProjectsAPI = ({
    workspaceId,
    projectId
}: {
    workspaceId: string;
    projectId?: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${projectId ? `/project/${projectId}` : ''}/gitlab/projects`,
        method: 'GET'
    });
};

export const getTrelloOrganizationsAPI = ({
    workspaceId,
    projectId
}: {
    workspaceId: string;
    projectId?: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/trello/organizations`,
        method: 'GET'
    });
};

export const getTrelloBoardDataAPI = ({
    workspaceId,
    projectId,
    boardId
}: {
    workspaceId: string;
    boardId: string;
    projectId?: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/trello/board/${boardId}`,
        method: 'GET'
    });
};

export const getBugasuraTeamsAPI = ({
    workspaceId,
    projectId
}: {
    workspaceId: string;
    projectId?: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${projectId ? `/project/${projectId}` : ''}/bugasura/teams`,
        method: 'GET'
    });
};
export const getBugasuraProjectsAPI = ({
    workspaceId,
    projectId,
    bugasuraTeamId
}: {
    workspaceId: string;
    projectId?: string;
    bugasuraTeamId: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/bugasura/teams/${bugasuraTeamId}/projects`,
        method: 'GET'
    });
};
export const getBugasuraSprintsAPI = ({
    workspaceId,
    projectId,
    bugasuraTeamId,
    bugasuraProjectId
}: {
    workspaceId: string;
    projectId?: string;
    bugasuraTeamId: string;
    bugasuraProjectId: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/bugasura/teams/${bugasuraTeamId}/bProject/${bugasuraProjectId}/sprints`,
        method: 'GET'
    });
};

export const getBugasuraTeamUsersAPI = ({
    workspaceId,
    projectId,
    bugasuraTeamId
}: {
    workspaceId: string;
    projectId?: string;
    bugasuraTeamId: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/bugasura/teams/${bugasuraTeamId}/team-users`,
        method: 'GET'
    });
};

export const connectBugasuraAPI = ({
    workspaceId,
    projectId,
    payload
}: {
    workspaceId: string;
    projectId?: string;
    payload: any;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/bugasura/connect`,
        method: 'POST',
        data: payload
    });
};

export const disconnectBugasuraAPI = ({
    workspaceId,
    projectId
}: {
    workspaceId: string;
    projectId?: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/bugasura/disconnect`,
        method: 'DELETE'
    });
};
export const getZohoPortalsAPI = ({
    workspaceId,
    projectId
}: {
    workspaceId: string;
    projectId?: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${projectId ? `/project/${projectId}` : ''}/zoho/portals`,
        method: 'GET'
    });
};

export const getZohoProjectsAPI = ({
    workspaceId,
    projectId,
    portalId
}: {
    workspaceId: string;
    projectId?: string;
    portalId: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/zoho/portals/${portalId}/projects`,
        method: 'GET'
    });
};
export const getZohoTasksAPI = ({
    workspaceId,
    projectId,
    portalId,
    zohoProjectId
}: {
    workspaceId: string;
    projectId?: string;
    portalId: string;
    zohoProjectId: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/zoho/portal/${portalId}/project/${zohoProjectId}/tasks`,
        method: 'GET'
    });
};

export const getZohoTaskListsAPI = ({
    workspaceId,
    projectId,
    portalId,
    zohoProjectId
}: {
    workspaceId: string;
    projectId?: string;
    portalId: string;
    zohoProjectId: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/zoho/portal/${portalId}/project/${zohoProjectId}/tasklists`,
        method: 'GET'
    });
};

export const getZohoTagsAPI = ({
    workspaceId,
    projectId,
    portalId,
    zohoProjectId
}: {
    workspaceId: string;
    projectId?: string;
    portalId: string;
    zohoProjectId: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/zoho/portal/${portalId}/project/${zohoProjectId}/tags`,
        method: 'GET'
    });
};

export const getZohoTeamsAPI = ({
    workspaceId,
    projectId,
    portalId,
    zohoProjectId
}: {
    workspaceId: string;
    projectId?: string;
    portalId: string;
    zohoProjectId: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/zoho/portal/${portalId}/project/${zohoProjectId}/teams`,
        method: 'GET'
    });
};

export const getZohoPrioritiesAPI = ({
    workspaceId,
    projectId,
    portalId,
    zohoProjectId
}: {
    workspaceId: string;
    projectId?: string;
    portalId: string;
    zohoProjectId: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/zoho/portal/${portalId}/project/${zohoProjectId}/priorities`,
        method: 'GET'
    });
};

export const getZohoBillingTypesAPI = ({
    workspaceId,
    projectId,
    portalId,
    zohoProjectId
}: {
    workspaceId: string;
    projectId?: string;
    portalId: string;
    zohoProjectId: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/zoho/portal/${portalId}/project/${zohoProjectId}/billing-types`,
        method: 'GET'
    });
};

export const getZohoAssigneesAPI = ({
    workspaceId,
    projectId,
    portalId,
    zohoProjectId
}: {
    workspaceId: string;
    projectId?: string;
    portalId: string;
    zohoProjectId: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/zoho/portal/${portalId}/project/${zohoProjectId}/assignee`,
        method: 'GET'
    });
};

export const getZohoModulesAPI = ({
    workspaceId,
    projectId,
    portalId
}: {
    workspaceId: string;
    projectId?: string;
    portalId: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/zoho/portal/${portalId}/modules`,
        method: 'GET'
    });
};

export const getZohoSeveritiesAPI = ({
    workspaceId,
    projectId,
    portalId
}: {
    workspaceId: string;
    projectId?: string;
    portalId: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/zoho/portal/${portalId}/severities`,
        method: 'GET'
    });
};

export const getZohoClassificationsAPI = ({
    workspaceId,
    projectId,
    portalId
}: {
    workspaceId: string;
    projectId?: string;
    portalId: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/zoho/portal/${portalId}/classifications`,
        method: 'GET'
    });
};

export const getZohoFollowersAPI = ({
    workspaceId,
    projectId,
    portalId,
    zohoProjectId
}: {
    workspaceId: string;
    projectId?: string;
    portalId: string;
    zohoProjectId: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/zoho/portal/${portalId}/project/${zohoProjectId}/assignee`,
        method: 'GET'
    });
};

export const getBasecampOrganizationsAPI = ({
    workspaceId,
    projectId
}: {
    workspaceId: string;
    projectId?: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/basecamp/organizations`,
        method: 'GET'
    });
};

export const getBasecampColumnsAPI = ({
    workspaceId,
    projectId,
    url
}: {
    workspaceId: string;
    projectId?: string;
    url?: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/basecamp/card-columns`,
        method: 'POST',
        data: {
            url: url
        }
    });
};

export const getBasecampAssigneeAPI = ({
    workspaceId,
    projectId,
    basecampOrganizationId,
    basecampBucketId
}: {
    workspaceId: string;
    projectId?: string;
    basecampOrganizationId: string;
    basecampBucketId: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/basecamp/${basecampOrganizationId}/assignees/${basecampBucketId}`,
        method: 'GET'
    });
};
export const getBasecampBucketsAPI = ({
    workspaceId,
    projectId,
    basecampOrganizationId
}: {
    workspaceId: string;
    projectId?: string;
    basecampOrganizationId: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/basecamp/buckets/${basecampOrganizationId}`,
        method: 'GET'
    });
};

export const getBasecampBoardsAPI = ({
    workspaceId,
    projectId,
    basecampOrganizationId,
    basecampProjectId,
    basecampBucketId
}: {
    workspaceId: string;
    projectId?: string;
    basecampOrganizationId: string;
    basecampProjectId: string;
    basecampBucketId: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/basecamp/organizations/${basecampOrganizationId}/projects/${basecampProjectId}/buckets/${basecampBucketId}/boards`,
        method: 'GET'
    });
};

export const getGitHubMetaDataAPI = ({
    workspaceId,
    projectId,
    owner,
    repo
}: {
    workspaceId: string;
    projectId?: string;
    owner: string | unknown;
    repo: string | unknown;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/github/${owner}/${repo}/assignees`,
        method: 'GET'
    });
};

export const getGitLabMetaDataAPI = ({
    workspaceId,
    projectId,
    gitlabProjectId
}: {
    workspaceId: string;
    projectId?: string;
    gitlabProjectId: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/gitlab/gitlab-project/${gitlabProjectId}/assignees`,
        method: 'GET'
    });
};

export const createGitLabTaskAPI = ({
    workspaceId,
    projectId,
    gitlabProjectId,
    payload
}: {
    workspaceId: string;
    projectId?: string;
    gitlabProjectId: string;
    payload: any;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/gitlab/${gitlabProjectId}/task`,
        method: 'POST',
        data: payload
    });
};
export const createZohoTaskAPI = ({
    workspaceId,
    projectId,
    portalId,
    zohoProjectId,
    payload
}: {
    workspaceId: string;
    projectId?: string;
    portalId: string;
    zohoProjectId: string;
    payload: any;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/zoho/portal/${portalId}/project/${zohoProjectId}/create`,
        method: 'POST',
        data: payload
    });
};

export const createGitHubTaskAPI = ({
    workspaceId,
    projectId,
    owner,
    repo,
    payload
}: {
    workspaceId: string;
    projectId?: string;
    owner: string | unknown;
    repo: string | unknown;
    payload: GitHubPayload;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/github/${owner}/${repo}/task`,
        method: 'POST',
        data: payload
    });
};

export const getMicrosoftTeamsChannelsByTeamIdAPI = ({
    workspaceId,
    teamId,
    projectId
}: {
    workspaceId: string;
    projectId?: string;
    teamId: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/microsoft-teams/teams/${teamId}/channels`,
        method: 'GET'
    });
};

export const createMicrosoftTeamsMessageAPI = ({
    workspaceId,
    projectId,
    teamId,
    channelId,
    payload
}: {
    workspaceId: string;
    projectId?: string;
    teamId: string;
    channelId: string;
    payload: BasicPayload;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/microsoft-teams/teams/${teamId}/channels/${channelId}/message`,
        method: 'POST',
        data: payload
    });
};

export const createBasecampTaskAPI = ({
    workspaceId,
    projectId,
    basecampOrganizationId,
    payload
}: {
    workspaceId: string;
    projectId?: string;
    basecampOrganizationId: string;
    payload: any;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/basecamp/${basecampOrganizationId}/task`,
        method: 'POST',
        data: payload
    });
};

export const createBugasuraTaskAPI = ({
    workspaceId,
    projectId,
    bugasuraProjectId,
    bugasuraTeamId,
    bugasuraSprintId,
    payload
}: {
    workspaceId: string;
    projectId?: string;
    bugasuraProjectId: string;
    bugasuraTeamId: string;
    bugasuraSprintId: string;
    payload: any;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/bugasura/bTeam/${bugasuraTeamId}/bProject/${bugasuraProjectId}/bSprint/${bugasuraSprintId}/task`,
        method: 'POST',
        data: payload
    });
};

// ProofHub API endpoints
export const getProofHubProjectsAPI = ({
    workspaceId,
    projectId
}: {
    workspaceId: string;
    projectId?: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/proofhub/projects`,
        method: 'GET'
    });
};

export const getProofHubTodolistsAPI = ({
    workspaceId,
    projectId,
    proofhubProjectId
}: {
    workspaceId: string;
    projectId?: string;
    proofhubProjectId: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/proofhub/projects/${proofhubProjectId}/todolists`,
        method: 'GET'
    });
};

export const getProofHubPeopleAPI = ({
    workspaceId,
    projectId
}: {
    workspaceId: string;
    projectId?: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${projectId ? `/project/${projectId}` : ''}/proofhub/people`,
        method: 'GET'
    });
};

export const getProofHubLabelsAPI = ({
    workspaceId,
    projectId
}: {
    workspaceId: string;
    projectId?: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${projectId ? `/project/${projectId}` : ''}/proofhub/labels`,
        method: 'GET'
    });
};

export const connectProofHubAPI = ({
    workspaceId,
    projectId,
    payload
}: {
    workspaceId: string;
    projectId?: string;
    payload: any;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/proofhub/connect`,
        method: 'POST',
        data: payload
    });
};

export const disconnectProofHubAPI = ({
    workspaceId,
    projectId
}: {
    workspaceId: string;
    projectId?: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/proofhub/disconnect`,
        method: 'DELETE'
    });
};

export const getProofHubTasksAPI = ({
    workspaceId,
    projectId,
    proofhubProjectId,
    proofhubTodolistId
}: {
    workspaceId: string;
    projectId?: string;
    proofhubProjectId: string;
    proofhubTodolistId: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/proofhub/projects/${proofhubProjectId}/todolists/${proofhubTodolistId}/tasks`,
        method: 'GET'
    });
};

export const createProofHubTaskAPI = ({
    workspaceId,
    projectId,
    proofhubProjectId,
    proofhubTodolistId,
    payload
}: {
    workspaceId: string;
    projectId?: string;
    proofhubProjectId: string;
    proofhubTodolistId: string;
    payload: any;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}${
            projectId ? `/project/${projectId}` : ''
        }/proofhub/projects/${proofhubProjectId}/todolists/${proofhubTodolistId}/tasks`,
        method: 'POST',
        data: payload
    });
};
