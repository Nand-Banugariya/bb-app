/* eslint-disable @typescript-eslint/no-explicit-any -- ported from bb-app as-is; typed when its feature moves over */
import { QueryParams } from './common';

export interface getAllSessionsAPIObject {
    workspaceId: string | string[];
    projectId: string | string[];
    queryParams: QueryParams;
    signal?: any;
}

export interface MetaDataModel {
    title: string;
    value: string;
}

export interface UpdateSessionPayload {
    title?: string;
    description?: string;
    priority?: string;
    screenshot?: Screenshot;
    screenRecording?: ScreenRecording;
    metaData?: MetaDataModel[];
    tags?: string[];
    bugStatus?: string;
    attachments?: string[];
}
