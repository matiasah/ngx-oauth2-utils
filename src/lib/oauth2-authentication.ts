export interface OAuth2Authentication {
    access_token: string;
    token_type: string;
    expires_in?: number;
    expires_at?: number;
    refresh_token?: string;
    scope?: string;
}
