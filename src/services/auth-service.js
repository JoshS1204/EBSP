import configuration  from '@/config';
import { UserManager, WebStorageStateStore, User, UserManagerSettings } from 'oidc-client';
import store from '@/store';
export default class AuthService {
    userManager;

    constructor( extraQueryParams ) {
        const settings = {
            userStore: new WebStorageStateStore({ store: window.sessionStorage }),
            authority: configuration.identity.authority,
            client_id: configuration.identity.clientId,
            redirect_uri: configuration.identity.redirectUri,
            response_type: 'code',
            scope: 'openid profile IdentityServerApi offline_access',
            extraQueryParams: extraQueryParams,
            signup: true
        };

        
        this.userManager = new UserManager(settings);
    }

    getManager() {
        return this.userManager;
    }

    getUser() {
        return this.userManager.getUser();
    }
    login() {
        return this.userManager.signinRedirect();
    }

    logout() {
        return this.userManager.signoutRedirect();
    }
    async getAccessToken() {
        const asyncToken = await this.userManager.getUser();
        return asyncToken?.access_token;
    }
}

export const auth = new AuthService();
