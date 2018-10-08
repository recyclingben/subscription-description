const 
    accessTokens = require('../../authentication/access-tokens')(),
    request = require('request'),
    requestPromise = require('request-promise-native'),
    nonces = require('../../authentication/nonces')(),
    csrfTokens = require('../../authentication/csrf-tokens')();

const getAccessToken = (req) => {
    if(!req.cookies['Session'])
        return undefined;

    const accessToken = accessTokens.tokens[
        req.cookies['Session']
    ];
    return accessToken;
};

const getUser = async (req) => {
    defaultUser = { isAuthenticated: false };

    accessToken = getAccessToken(req);

    if(!accessToken)
        return defaultUser;

    parameters = `part=snippet,contentDetails&mine=true&access_token=${accessToken}`;
    requestOptions = {
        url: `https://www.googleapis.com/youtube/v3/channels?${parameters}`,
        method: 'GET'
    };
    const user = await (async () => { 
        let body = JSON.parse(
            await requestPromise(requestOptions)
        ); 
        let user = body.items[0];
        user.isAuthenticated = true;
        return user;
    })();

    return user;
};

module.exports = (app, config) => {
    app.use('/', async (req, res, next) => {
        res.locals.config = config;
        res.locals.user = await getUser(req);

        if(res.locals.user.isAuthenticated) {
            if(!csrfTokens.tokens[req.cookies['Session']]) {
                csrfTokens.create(req.cookies['Session']);
            }
            res.locals.csrfToken = csrfTokens.tokens[req.cookies['Session']];
        }

        next();
    });

    return {
        app: app,
        config: config,
        accessTokens: accessTokens,
        request: request,
        nonces: nonces,
        requestPromise: requestPromise,
        csrfTokens: csrfTokens,
        getAccessToken: getAccessToken
    };
};