import { QueryParams } from './common';

export interface GetBugCommentsAPIObject {
    workspaceId: string | string[];
    projectId: string | string[];
    bugId: string | string[];
    queryParams?: QueryParams | null | undefined;
}
