export interface ErrorResponse {
    errorCode: number;
    message: string;
}

export interface Workspace {
    id: string;
    name: string;
    logo: string;
    status: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface InvitedBy {
    id: string;
    name: string;
    email: string;
}

export interface VerifyTokenData {
    workspace: Workspace;
    invitedBy: InvitedBy;
}
