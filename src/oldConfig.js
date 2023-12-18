const env = 'dev' // change to prod for production build

const dev = {
    // apiUrl: 'http://event-api.com', // for local backend
    apiUrl: 'https://api.diywebsite.net.au', // for staging backend
    redirectUri: 'https://www.diywebsite.net.au/b/org/events/seat-plans/',
    env: env,
    identity: {
        authority: 'https://identity.diywebsite.net.au',
        clientId: 'EBSeatPlan',
        redirectUri: 'http://127.0.0.1:5173/authcallback',
        postLogoutRedirectUri: 'http://127.0.0.1:5173'
    }
}

const prod = {
    apiUrl: 'https://api.diywebsite.net.au', // for production backend
    redirectUri: 'https://www.diywebsite.net.au/b/org/events/seat-plans/',
    env: env,
    identity: {
        authority: 'https://identity.diywebsite.net.au',
        clientId: 'EBSeatPlan',
        redirectUri: 'https://seat-plan.diywebsite.net.au/authcallback',
        postLogoutRedirectUri: 'https://seat-plan.diywebsite.net.au'
    }
}

const config = {
    dev,
    prod
}

export default config[env]
