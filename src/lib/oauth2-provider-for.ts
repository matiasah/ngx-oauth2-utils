import { Provider } from '@angular/compiler/src/core';
import { OAuth2Provider } from './oauth2-provider';
import { OAUTH2_PROVIDERS } from './oauth2-providers';

export function OAuth2ProviderFor(oauth2Providers: OAuth2Provider[]): Provider {
    return {
        provide: OAUTH2_PROVIDERS,
        useValue: oauth2Providers
    };
}
