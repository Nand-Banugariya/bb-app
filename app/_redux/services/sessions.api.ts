/* eslint-disable @typescript-eslint/no-explicit-any -- ported from bb-app as-is; typed when its feature moves over */
import { fetch } from '@lib/axiosConfig';
import { UpdateSessionPayload, getAllSessionsAPIObject } from '../models/session';
import { SessionObject } from '../slices/sessions';
import { BugActivityLogSuccessResponse } from '../slices/bugActivityLog';
import { QueryParams } from '../models/common';

export const getAllSessionsAPI = async ({
    workspaceId,
    projectId,
    queryParams,
    signal
}: getAllSessionsAPIObject): Promise<SessionObject> => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/bug`,
        method: 'GET',
        params: queryParams,
        signal
    });
};

export const getAllSessionsFromAllProjectsAPI = async ({
    workspaceId,
    queryParams,
    signal
}: {
    workspaceId: string | string[];
    queryParams: QueryParams;
    signal?: any;
}): Promise<SessionObject> => {
    return fetch({
        url: `/workspace/${workspaceId}/bug`,
        method: 'GET',
        params: queryParams,
        signal
    });
};

export const deleteSessionAPI = async ({
    workspaceId,
    projectId,
    bugIds
}: {
    workspaceId: string | string[];
    projectId: string | string[];
    bugIds: string | string[];
}): Promise<any> => {
    const data = { bugIds: bugIds };
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/bug`,
        method: 'DELETE',
        data: data
    });
};

export const archiveSessionAPI = async ({
    workspaceId,
    projectId,
    bugIds,
    isAll,
    filters
}: {
    workspaceId: string | string[];
    projectId: string | string[];
    bugIds: string | string[];
    isAll?: boolean;
    // With isAll: the list's filters, so it archives what the list shows.
    filters?: Record<string, any>;
}): Promise<any> => {
    const data = {
        bugIds: bugIds,
        ...(isAll && { isAll: true, filters })
    };
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/bug/archive`,
        method: 'DELETE',
        data: data
    });
};

export const restoreArchivedSessionAPI = async ({
    workspaceId,
    projectId,
    bugIds
}: {
    workspaceId: string | string[];
    projectId: string | string[];
    bugIds: string | string[];
}): Promise<any> => {
    const data = { bugIds: bugIds };
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/bug/restore`,
        method: 'POST',
        data: data
    });
};

export const getAllOrSearchTagsAPI = async ({
    projectId,
    signal,
    workspaceId,
    search
}: any): Promise<any> => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/tag?orderBy=updatedAt%7Cdesc${
            search ? `&search_column=label&search=${encodeURIComponent(search)}` : ''
        }`,
        signal: signal ? signal : null,
        method: 'GET'
    });
};
export const getTagByIdAPI = async ({ tagId, projectId, workspaceId }: any): Promise<any> => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/tag/${tagId}`,
        method: 'GET'
    });
};
export const createNewTagAPI = async ({ projectId, workspaceId, payload }: any): Promise<any> => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/tag`,
        method: 'POST',
        data: payload
    });
};

export const updateTagAPI = async ({
    projectId,
    workspaceId,
    tagId,
    payload
}: any): Promise<any> => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/tag/${tagId}`,
        method: 'PATCH',
        data: payload
    });
};

export const inviteUserAPI = async ({
    projectId,
    bugId,
    payload,
    workspaceId
}: any): Promise<any> => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/bug/${bugId}/invite`,
        method: 'PATCH',
        data: payload
    });
};

export const removeInviteUserAPI = async ({
    projectId,
    bugId,
    workspaceId,
    inviteId
}: any): Promise<any> => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/bug/${bugId}/invite/${inviteId}`,
        method: 'DELETE'
    });
};

export const reInviteUserAPI = async ({
    projectId,
    bugId,
    workspaceId,
    inviteId
}: any): Promise<any> => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/bug/${bugId}/invite/${inviteId}`,
        method: 'PATCH'
    });
};

export const deleteTagsAPI = async ({ projectId, workspaceId, payload }: any): Promise<any> => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/tag`,
        method: 'DELETE',
        data: payload
    });
};
export const updateSessionAPI = async ({
    workspaceId,
    projectId,
    bugId,
    payload,
    signal
}: {
    workspaceId: string | string[];
    projectId: string | string[];
    bugId: string | string[];
    payload: UpdateSessionPayload;
    signal?: any;
}): Promise<SessionObject> => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/bug/${bugId}`,
        method: 'PATCH',
        data: payload,
        signal: signal ? signal : null
    });
};
export const updateSessionTitleAPI = async ({
    workspaceId,
    projectId,
    bugId,
    payload,
    signal
}: {
    workspaceId: string | string[];
    projectId: string | string[];
    bugId: string | string[];
    payload: UpdateSessionPayload;
    signal?: any;
}): Promise<SessionObject> => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/bug/${bugId}/title`,
        method: 'PATCH',
        data: payload,
        signal: signal ? signal : null
    });
};

export const updateSessionDescriptionAPI = async ({
    workspaceId,
    projectId,
    bugId,
    payload,
    signal
}: {
    workspaceId: string | string[];
    projectId: string | string[];
    bugId: string | string[];
    payload: UpdateSessionPayload;
    signal?: any;
}): Promise<SessionObject> => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/bug/${bugId}/description`,
        method: 'PATCH',
        data: payload,
        signal: signal ? signal : null
    });
};

export const updateSessionPriorityAPI = async ({
    workspaceId,
    projectId,
    bugId,
    payload,
    signal
}: {
    workspaceId: string | string[];
    projectId: string | string[];
    bugId: string | string[];
    payload: UpdateSessionPayload;
    signal?: any;
}): Promise<SessionObject> => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/bug/${bugId}/priority`,
        method: 'PATCH',
        data: payload,
        signal: signal ? signal : null
    });
};

export const updateSessionStatusAPI = async ({
    workspaceId,
    projectId,
    bugId,
    payload,
    signal
}: {
    workspaceId: string | string[];
    projectId: string | string[];
    bugId: string | string[];
    payload: UpdateSessionPayload;
    signal?: any;
}): Promise<SessionObject> => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/bug/${bugId}/status`,
        method: 'PATCH',
        data: payload,
        signal: signal ? signal : null
    });
};

export const updateSessionAttachmentsAPI = async ({
    workspaceId,
    projectId,
    bugId,
    payload,
    signal
}: {
    workspaceId: string | string[];
    projectId: string | string[];
    bugId: string | string[];
    payload: UpdateSessionPayload;
    signal?: any;
}): Promise<SessionObject> => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/bug/${bugId}/attachments`,
        method: 'PATCH',
        data: payload,
        signal: signal ? signal : null
    });
};

export const updateSessionTagsAPI = async ({
    workspaceId,
    projectId,
    bugId,
    payload,
    signal
}: {
    workspaceId: string | string[];
    projectId: string | string[];
    bugId: string | string[];
    payload: UpdateSessionPayload;
    signal?: any;
}): Promise<SessionObject> => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/bug/${bugId}/tags`,
        method: 'PATCH',
        data: payload,
        signal: signal ? signal : null
    });
};

export const updateSessionMetaDataAPI = async ({
    workspaceId,
    projectId,
    bugId,
    payload,
    signal
}: {
    workspaceId: string | string[];
    projectId: string | string[];
    bugId: string | string[];
    payload: UpdateSessionPayload;
    signal?: any;
}): Promise<SessionObject> => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/bug/${bugId}/meta-data`,
        method: 'PATCH',
        data: payload,
        signal: signal ? signal : null
    });
};

const defaultQueryParams = {
    orderBy: 'createdAt|desc',
    take: 5,
    include: ['user', 'bugHasCommentHasReaction']
};
export const getSessionActivityLogsAPI = async ({
    workspaceId,
    projectId,
    bugId,
    queryParams = defaultQueryParams
}: {
    workspaceId: string | string[];
    projectId: string | string[];
    bugId: string | string[];
    queryParams?: QueryParams;
}): Promise<BugActivityLogSuccessResponse> => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/bug/${bugId}/activity-logs`,
        method: 'GET',
        params: queryParams
    });
};

export const changeSessionProjectAPI = async ({
    workspaceId,
    projectId,
    payload
}: {
    workspaceId: string | string[];
    projectId: string | string[];
    payload: any;
}): Promise<SessionObject> => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/bug/change-project`,
        method: 'PATCH',
        data: payload
    });
};

// Error context for the AI steps endpoints, sent apart from `steps` (which
// holds only user actions). The API dedupes, caps each list at 20 and
// truncates long text, and rejects entries without a message / url.
export interface AIStepsConsoleError {
    message: string;
    type?: 'error' | 'warn';
    // e.g. "checkout.js:42:13"
    source?: string;
    url?: string;
    timestamp?: string;
}

export interface AIStepsNetworkError {
    url: string;
    method?: string;
    // 0 for requests that never got a response (blocked/CORS/offline).
    statusCode?: number;
    statusText?: string;
    errorMessage?: string;
    responseBody?: string | object;
    timestamp?: string;
}

export const generateAISteps = ({
    payload,
    workspaceId,
    projectId,
    endpoint = ''
}: {
    workspaceId: string;
    projectId: string;
    payload: {
        steps?: string[];
        description: string;
        title: string;
        imageSource?: string;
        bugId?: string;
        // Required by the `/steps/video` endpoint: the consolidated `results`
        // string from getVideoAnalysis. Only set when video analysis is
        // COMPLETED; the caller falls back to the standard `/steps` endpoint
        // (no videoAnalysis) otherwise.
        videoAnalysis?: string;
        consoleErrors?: AIStepsConsoleError[];
        networkErrors?: AIStepsNetworkError[];
    };
    endpoint?: string;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/steps${endpoint}`,
        method: 'POST',
        data: payload
    });
};

export const generateAIDebuggerResp = ({
    workspaceId,
    projectId,
    payload,
    signal
}: {
    workspaceId: string;
    projectId: string;
    payload: {
        networkLogs: string[];
        consoleLogs: string[];
        steps: string[];
        title: string;
        description: string;
        // Optional consolidated AI video-frame analysis (the `results` string
        // from getVideoAnalysis). Only set for screen-recording bugs whose
        // analysis is COMPLETED; omitted entirely otherwise.
        videoAnalysis?: string;
    };
    signal?: any;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/debugger`,
        method: 'POST',
        data: payload,
        signal
    });
};

export type VideoAnalysisStatus = 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface VideoAnalysisResponse {
    id: string;
    frameCount: number;
    batchCount: number;
    // Consolidated AI frame-batch analysis. Null unless status is COMPLETED.
    results: string | null;
    hasSpeech: boolean;
    audioTranscript: string | null;
    status: VideoAnalysisStatus;
    errorMessage: string | null;
    processingTime: number | null;
}

// Fetches (or lazily generates, server-side) the AI video analysis for a bug's
// stored recording. The frontend never uploads video directly — this GET drives
// generation. For a bug with no cached analysis the backend runs the full
// pipeline synchronously, so this call can take 30-60s+. Returns 404 when the
// bug has no video, 403 on free plans.
export const getVideoAnalysis = ({
    workspaceId,
    bugId,
    signal
}: {
    workspaceId: string;
    bugId: string;
    signal?: AbortSignal;
}): Promise<VideoAnalysisResponse> => {
    return fetch({
        url: `/workspace/${workspaceId}/video-analysis/bug/${bugId}/analysis`,
        method: 'GET',
        signal
    });
};

export const aiFeedback = ({
    payload,
    signal,
    workspaceId,
    projectId
}: {
    workspaceId: string;
    projectId: string;
    payload: {
        feedback: string;
        bugId: string;
        promptId: string;
        generatedResponse: string;
        context: string;
    };
    signal?: any;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/ai-feedback`,
        method: 'POST',
        data: payload,
        signal
    });
};

export const addAssignee = (
    payload: {
        workspaceId: string;
        projectId: string;
        bugId: string;
        assignee: string;
    },
    signal?: any
) => {
    return fetch({
        url: `/workspace/${payload.workspaceId}/project/${payload.projectId}/bug/${payload.bugId}/assignee`,
        method: 'POST',
        data: {
            assignee: payload.assignee
        },
        signal
    });
};

export const removeAssignee = (
    payload: {
        workspaceId: string;
        projectId: string;
        bugId: string;
        assignee: string;
    },
    signal?: any
) => {
    return fetch({
        url: `/workspace/${payload.workspaceId}/project/${payload.projectId}/bug/${payload.bugId}/assignee/${payload.assignee}`,
        method: 'DELETE',
        signal
    });
};

export const getAssigneesByBugId = (
    payload: {
        workspaceId: string;
        projectId: string;
        bugId: string;
    },
    signal?: any
) => {
    return fetch({
        url: `/workspace/${payload.workspaceId}/project/${payload.projectId}/bug/${payload.bugId}/assignee`,
        method: 'GET',
        signal
    });
};

export interface SavedViewPayload {
    isPublic: boolean;
    filter: {
        priority: ('LOW' | 'MEDIUM' | 'HIGH' | 'URGENT')[];
        bugStatus: ('OPEN' | 'IN_PROGRESS' | 'CLOSED')[];
        userId: string[];
        assignees: string[];
        tags: any[];
        integration: string[];
        showArchived: 'YES' | 'NO';
        creationSource: string[];
        filterName: string;
        isPriority: 'YES' | 'NO';
        isBugStatus: 'YES' | 'NO';
        isUser: 'YES' | 'NO';
        isAssignee: 'YES' | 'NO';
        isCreationSource: 'YES' | 'NO';
        isIntegration: 'YES' | 'NO';
        isTag: 'YES' | 'NO';
        search: string;
        startDate: string;
        endDate: string;
    };
}

export const getSavedViewsAPI = async ({
    workspaceId,
    projectId
}: {
    workspaceId: string;
    projectId: string;
}): Promise<any> => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/filters`,
        method: 'GET'
    });
};

export const saveViewAPI = async ({
    workspaceId,
    projectId,
    payload
}: {
    workspaceId: string;
    projectId: string;
    payload: SavedViewPayload;
}): Promise<any> => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/filters`,
        method: 'POST',
        data: payload
    });
};

export const deleteViewAPI = async ({
    workspaceId,
    projectId,
    viewId
}: {
    workspaceId: string;
    projectId: string;
    viewId: string;
}): Promise<any> => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/filters/${viewId}`,
        method: 'DELETE'
    });
};

export const updateBulkSessionAPI = async ({
    workspaceId,
    projectId,
    payload
}: {
    workspaceId: string;
    projectId: string;
    payload: any;
}): Promise<any> => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/bug/bulk-session-update`,
        method: 'PATCH',
        data: payload
    });
};

export const editViewAPI = async ({
    workspaceId,
    projectId,
    viewId,
    payload
}: {
    workspaceId: string;
    projectId: string;
    viewId?: string;
    payload: SavedViewPayload;
}): Promise<any> => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/filters/${viewId}`,
        method: 'PATCH',
        data: payload
    });
};

export const sendAIChatMessage = ({
    workspaceId,
    projectId,
    bugId,
    content,
    chatId = '',
    initialDebug,
    signal
}: {
    workspaceId: string;
    projectId: string;
    bugId: string;
    content: string;
    chatId?: string;
    initialDebug?: string | null;
    signal?: AbortSignal;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/ai/chat/messages/${bugId}`,
        method: 'POST',
        data: {
            content,
            chatId,
            initialDebug
        },
        signal
    });
};

export const getAIChatMessages = ({
    workspaceId,
    projectId,
    bugId,
    signal
}: {
    workspaceId: string;
    projectId: string;
    bugId: string;
    signal?: AbortSignal;
}) => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/ai/chat/messages/${bugId}`,
        method: 'GET',
        signal
    });
};

export const deleteAllSessionsAPI = async ({
    workspaceId,
    projectId
}: {
    workspaceId: string | string[];
    projectId: string | string[];
}): Promise<any> => {
    return fetch({
        url: `/workspace/${workspaceId}/project/${projectId}/bug/delete-all`,
        method: 'DELETE'
    });
};

export const deleteAllSessionsFromAllProjectsAPI = async ({
    workspaceId
}: {
    workspaceId: string | string[];
}): Promise<any> => {
    return fetch({
        url: `/workspace/${workspaceId}/bug/delete-all`,
        method: 'DELETE'
    });
};

export const generateAutomationScript = ({
    payload
}: {
    payload: {
        framework: string;
        language: string;
        bugId: string;
    };
}): Promise<any> => {
    const { framework, language, bugId } = payload;
    const FRAMEWORK_MAP: Record<string, string> = {
        Playwright: 'playwright', // Send 'Playwright', not 'PLAYWRIGHT'
        Selenium: 'selenium' // Send 'Selenium', not 'SELENIUM'
    };

    const LANGUAGE_MAP: Record<string, string> = {
        js: 'javascript', // Send 'js', not 'JAVASCRIPT'
        ts: 'typescript', // Send 'ts', not 'TYPESCRIPT'
        java: 'java', // Send 'java', not 'JAVA'
        py: 'python' // Send 'py', not 'PYTHON'
    };

    const backendFramework = FRAMEWORK_MAP[framework];
    const backendLanguage = LANGUAGE_MAP[language];
    const backendRequestBody = {
        bugId,
        framework: backendFramework, // Will be 'Playwright' or 'Selenium'
        language: backendLanguage, // Will be 'javascript', 'typescript', 'java', or 'python'
        steps: []
    };
    return fetch({
        url: `/script-generator/generate`,
        method: 'POST',
        data: backendRequestBody
    });
};
