# ngx-oauth2-utils

A utility library that can be used to request OAuth2 tokens from multiple OAuth2 providers.

## Installation
Run the following command in your project folder.
```
npm install ngx-oauth2-utils
```

## Usage
Import the following method in your module file.
```
import { OAuth2ProviderFor } from 'ngx-oauth2-utils';
```

Define the following provider in your module's NgModule declaration.
```ts
    ...
    providers: [
        OAuth2ProviderFor([
            {
                name: 'Google',
                accessTokenUri: 'https://github.com/login/oauth/access_token',
                authorizationUri: 'https://accounts.google.com/o/oauth2/v2/auth',
                clientId: '',
                scope: 'email profile',
                authorizationParams: {
                prompt: 'consent',
                access_type: 'online'
                }
            },
            {
                name: 'Facebook',
                accessTokenUri: 'https://graph.facebook.com/v4.0/oauth/access_token',
                authorizationUri: 'https://www.facebook.com/v4.0/dialog/oauth',
                clientId: '',
                scope: 'public_profile email'
            }
        ])
    ],
    ...
```

Inject the ```OAuth2Service``` into your components.
```ts
import { Component } from '@angular/core';
import { OAuth2Service, OAuth2Authentication } from 'ngx-oauth2-utils';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

    // The authentication
    private authentication: OAuth2Authentication;

    public constructor(
        private oauth2Service: OAuth2Service
    ) {

        // Attempt to handle the authentication in the activated route
        this.oauth2Service.getSignInAuthentication().subscribe(
            authentication => {

                // Authentication found, set the current authentication to the one received
                this.oauth2Service.setAuthentication(authentication);
            }
        );

        // Get the authentication stored in the localStorage
        this.authentication = this.oauth2Service.getAuthentication();

    }

    public signInWithGoogle(): void {
        this.oauth2Service.signIn('Google');
    }

    public signInWithFacebook(): void {
        this.oauth2Service.signIn('Facebook');
    }

}
```