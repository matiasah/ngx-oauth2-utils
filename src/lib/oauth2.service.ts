import { Injectable, Inject } from '@angular/core';
import { HttpParams, HttpRequest } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { OAuth2Provider } from './oauth2-provider';
import { OAUTH2_PROVIDERS } from './oauth2-providers';
import { OAuth2Authentication } from './oauth2-authentication';

@Injectable({
  providedIn: 'root'
})
export class OAuth2Service {

  // Authentication
  private authentication?: OAuth2Authentication;

  public constructor(
    @Inject(OAUTH2_PROVIDERS)
    private providers: OAuth2Provider[],
    private activatedRoute: ActivatedRoute
  ) {

  }

  public getSignInAuthentication(): Observable<OAuth2Authentication | undefined> {
    return this.activatedRoute.fragment.pipe(map(
      fragment => {
        // Process fragment
        const params: URLSearchParams = new URLSearchParams(fragment);

        // Get access token
        const accessToken = params.get('access_token');

        // If fragment contains access token
        if (accessToken) {
          // Get expiration
          const expiresInAsString = params.get('expires_in');
          const expiresIn = expiresInAsString ? parseInt(expiresInAsString, 10) : undefined;
          const expiresAt = expiresIn ? Date.now() + expiresIn : undefined;

          // Create authentication
          const authentication: OAuth2Authentication = {
            access_token: accessToken,
            token_type: params.get('token_type'),
            expires_in: expiresIn,
            expires_at: expiresAt,
            refresh_token: params.get('refresh_token'),
            scope: params.get('scope')
          };

          // Return authentication
          return authentication;
        }

        // No authentication, throw error
        throwError('no authentication');
      }
    ));
  }

  public setAuthentication(authentication: OAuth2Authentication | undefined): void {
    if (authentication) {
      // Set authentication
      this.authentication = authentication;

      // Stringify
      const authenticationAsString = JSON.stringify(authentication);

      // Put in storage
      localStorage.setItem('oauth2_authentication', authenticationAsString);
    } else {
      // Remove authentication in memory
      this.authentication = undefined;

      // Remove from storage
      localStorage.removeItem('oauth2_authentication');
    }
  }

  public getAuthentication(): OAuth2Authentication | undefined {
    // If there's an authentication in memory
    if (this.authentication) {
      // If it's not expired
      if (!this.authentication.expires_at || Date.now() < this.authentication.expires_at) {

        // Return the authentication
        return this.authentication;
      }

      // Remove authentication
      this.setAuthentication(undefined);

      // Return no authentication
      return undefined;
    }

    // Get authentication from localStorage
    const authenticationAsString = localStorage.getItem('oauth2_authentication');

    // If storage contains authentication
    if (authenticationAsString) {
      // Decode and put in memory
      this.authentication = JSON.parse(authenticationAsString);

      // If it's a valid object
      if (this.authentication) {

        // If it's not expired
        if (!this.authentication.expires_at || Date.now() < this.authentication.expires_at) {

          // Return the authentication
          return this.authentication;
        }

        // Remove authentication
        this.setAuthentication(undefined);
      }
    }

    // No authentication found, return undefined
    return undefined;
  }

  public signIn(name: string, redirectUri?: string): boolean {
    // Find provider by name
    let targetProvider: OAuth2Provider;

    // For each provider
    for (const provider of this.providers) {

      // If provider with given name exists
      if (provider.name === name) {

        // Set the target provider
        targetProvider = provider;
        break;
      }
    }

    if (targetProvider) {

      // If redirect URI wasn't set
      if (!redirectUri) {

        // Set the redirect URI
        redirectUri = targetProvider.redirectUri ? targetProvider.redirectUri : window.location.origin;
      }

      // Params
      let params: HttpParams = new HttpParams()
        .set('response_type', 'token')
        .set('client_id', targetProvider.clientId)
        .set('redirect_uri', redirectUri)
        .set('scope', targetProvider.scope);

      // Additional authorization params
      if (targetProvider.authorizationParams) {

        // For each param
        for (const [param, value] of Object.entries(targetProvider.authorizationParams)) {

          // Add the authorization param
          params = params.set(param, value);
        }
      }

      // Request
      const request = new HttpRequest('GET', targetProvider.authorizationUri, { params });

      // Navigate
      window.location.href = request.urlWithParams;

      // Authentication provider found
      return true;
    }

    // No authentication provider found
    return false;
  }

}
