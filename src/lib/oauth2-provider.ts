export interface OAuth2Provider {
    authorizationUri: string;
    name: string;
    clientId: string;
    scope: string;
    redirectUri?: string;
    authorizationParams?: {[param: string]: any};
}
