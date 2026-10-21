export interface SocialLoginPayload {
    code: string;
    captchaToken: string;
    invitationToken?: string | null;
    requestToken?: string | null;
    utmSourceToken?: string | null;
    // Invite-link tokens carried through the OAuth `state` round trip — see
    // app/_libs/auth/joinTokens.ts.
    inviteLinkToken?: string | null;
    projectInviteLinkToken?: string | null;
}

export interface AuthHeaderParams {
    authorization?: string;
}

export interface InvitationPayload {
    invitationToken?: string | string[];
}

export interface RequestPayload {
    requestToken?: string | string[];
}
