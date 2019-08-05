export interface OAuth2Provider {
    accessTokenUri: string;
    authorizationUri: string;
    name: string;
    clientId: string;
    scope: string;
    redirectUri?: string;
    authorizationParams?: {[param: string]: any};
}
