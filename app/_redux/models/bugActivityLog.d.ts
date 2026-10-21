import { QueryParams } from './common';

export interface GetBugActivityLogsAPIObject {
    workspaceId: string | string[];
    projectId: string | string[];
    bugId: string | string[];
    queryParams?: QueryParams;
}
