import { fetch } from '@lib/axiosConfig';

export interface OAuthAuthorizePayload {
    client_id: string;
    redirect_uri: string;
    scope: string;
    state?: string;
}

export interface OAuthDenyPayload {
    client_id: string;
    redirect_uri: string;
    scope: string;
    state?: string;
}

export interface OAuthResponse {
    authorizationUrl?: string;
    redirect_uri?: string;
    code?: string;
    error?: string;
    error_description?: string;
}

export interface ClientScope {
    name: string;
    description: string;
    isDefault: boolean;
}

export interface ClientDetails {
    id: string;
    clientId: string;
    name: string;
    description?: string;
    clientType?: string;
    redirectUris: string[];
    website?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    scopes: ClientScope[];
}

export const oauthAuthorizeAPI = async (payload: OAuthAuthorizePayload): Promise<OAuthResponse> => {
    const params = new URLSearchParams({
        client_id: payload.client_id,
        redirect_uri: payload.redirect_uri,
        scope: payload.scope
    });

    if (payload.state) {
        params.set('state', payload.state);
    }

    return fetch({
        url: `/oauth/authorize?${params.toString()}`,
        method: 'GET'
    });
};

export const oauthDenyAPI = async (payload: OAuthDenyPayload): Promise<OAuthResponse> => {
    const params = new URLSearchParams({
        client_id: payload.client_id,
        redirect_uri: payload.redirect_uri,
        scope: payload.scope,
        deny: 'true'
    });

    if (payload.state) {
        params.set('state', payload.state);
    }

    return fetch({
        url: `/oauth/authorize?${params.toString()}`,
        method: 'GET'
    });
};

export const getClientDetailsAPI = async (clientId: string): Promise<ClientDetails> => {
    return fetch({
        url: `/oauth/clients/${clientId}`,
        method: 'GET'
    });
};
