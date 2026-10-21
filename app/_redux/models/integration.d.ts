/* eslint-disable @typescript-eslint/no-explicit-any -- ported from bb-app as-is; typed when its feature moves over */
import { DropdownObject } from './common';

// asana integration interfaces
export interface AsanaPayload {
    projectId: string | undefined;
    assigneeId: string | undefined;
    dueDate: Date | null | undefined;
    sectionId: string | undefined;
    parentTaskId: string | undefined;
    tags: string[];
}

export interface AsanaPlatformDetailsObject {
    projects: UnknownPlatformDetails;
    tags: UnknownPlatformDetails;
    assignee: UnknownPlatformDetails;
}

export interface AsanaDetails {
    projects: DropdownObject[] | UnknownTypeObject[];
    assignee: DropdownObject[] | UnknownTypeObject[];
    tags: DropdownObject[] | UnknownTypeObject[];
    sections: DropdownObject[] | UnknownTypeObject[];
    parentTasks: DropdownObject[] | UnknownTypeObject[];
}

//clickUp integration Interfaces

export interface ClickUpPayload {
    workspaceId: string | undefined;
    listId: string | undefined;
    priority: number | null;
    dueDate: number | null;
    assigneeId: string | undefined;
    tags: string[];
}

export interface ClickUpPlatformDetailsObject {
    [key: string]: unknown;
    teams: {
        [key: string]: unknown;
        members: {
            [key: string]: unknown;
            user: UnknownTypeObject;
        }[];
    }[];
}

export interface SpaceDetailsObject {
    [key: string]: unknown;
    features: {
        [key: string]: UnknownTypeObject;
        priorities: {
            [key: string]: unknown;
            priorities: UnknownTypeObject[];
        };
    };
}

export interface FolderDetailsObject {
    [key: string]: unknown;
    lists: UnknownTypeObject[];
}

export interface ClickUpDetails {
    workspace: DropdownObject[] | UnknownTypeObject[];
    assignee: DropdownObject[] | UnknownTypeObject[];
    spaces: DropdownObject[];
    folders: DropdownObject[];
    tags: DropdownObject[];
    lists: DropdownObject[] | UnknownTypeObject[] | undefined;
    priority: DropdownObject[] | UnknownTypeObject[] | undefined;
}

//github integration interfaces

export interface GitHubPayload {
    assignees: string[];
    labels: string[];
    milestone: string[] | null;
    dueDate: Date | null | undefined;
}

export interface GithubApiParams {
    workspaceId: string;
    projectId: string;
    owner: string | unknown;
    repo: string | unknown;
}

export interface GitHubPlatformDetailsObject {
    [key: string]: unknown;
    owner: UnknownTypeObject;
}

export interface GithubDetails {
    repositories: DropdownObject[] | UnknownTypeObject[];
    assignees: DropdownObject[];
    milestone: DropdownObject[];
    labels: DropdownObject[];
}

// jira integration interfaces

export interface JiraPayload {
    projectId: string | undefined;
    issueTypeId: string | undefined;
    assigneeId: string | undefined;
    labels: string[];
    extraOptions: { [key: string]: unknown } | any;
}

export interface JiraPlatformDetailsObject {
    [key: string]: unknown;
    projects: {
        [key: string]: unknown;
        issuetypes: UnknownTypeObject[];
    }[];
}

export interface JiraDetails {
    projects: DropdownObject[] | UnknownTypeObject[];
    issueType: DropdownObject[] | UnknownTypeObject[];
    assignee: DropdownObject[] | UnknownTypeObject[];
    label: DropdownObject[] | UnknownTypeObject[];
}

// linear integration interfaces

export interface LinearPayload {
    teamId: string | undefined;
    statusId: string | undefined;
    projectId: string | undefined;
    priority: string | undefined;
    labelIds: string[];
    assigneeId: string | undefined;
    parentId: string | undefined;
}

export interface LinearPlatformDetailsObject {
    [key: string]: unknown;
    meta: {
        labels: UnknownTypeObject[];
        members: UnknownTypeObject[];
        priority: UnknownTypeObject[];
        projects: UnknownTypeObject[];
        states: UnknownTypeObject[];
        issues: UnknownTypeObject[];
    };
}

export interface LinearDetails {
    teams: DropdownObject[] | UnknownTypeObject[];
    labels: DropdownObject[] | UnknownTypeObject[];
    members: DropdownObject[] | UnknownTypeObject[];
    priority: DropdownObject[] | UnknownTypeObject[];
    projects: DropdownObject[] | UnknownTypeObject[];
    states: DropdownObject[] | UnknownTypeObject[];
    parentIssue: DropdownObject[] | UnknownTypeObject[];
}

// microsoft teams integration interfaces

export interface MicrosoftTeamsApiParams {
    workspaceId: string;
    projectId: string;
    teamId: string;
    channelId: string;
}

export interface MicrosoftTeamsPlatformDetailsObject extends UnknownTypeObject {
    value: UnknownTypeObject[];
}

export interface MicrosoftTeamsDetails {
    teams: DropdownObject[] | UnknownTypeObject[];
    channels: DropdownObject[];
}

// slack integration payload

export interface SlackPayload {
    channelId: string | undefined;
}

// comman

export interface UnknownTypeObject {
    [key: string]: unknown;
}

export interface UnknownPlatformDetails {
    status: string;
    data: UnknownTypeObject[];
}

export interface ProjectIdAsParams {
    workspaceId: string;
    projectId?: string;
    siteURL?: string;
}

export interface ClickUpSpaceIdObject extends ProjectIdAsParams {
    spaceId: string | undefined;
}

export interface BasicPayload {
    bugId: string;
    title: string;
    description: string;
}

export interface CreatePlatformTaskAPIObject {
    payload: AsanaPayload | ClickUpPayload | LinearPayload | SlackPayload | JiraPayload;
    workspaceId: string;
    projectId: string;
    path: string;
    siteURL?: string;
}

export interface ConnectPayload {
    code: string | string[];
    installationId?: string;
    orgSlug?: string;
}
