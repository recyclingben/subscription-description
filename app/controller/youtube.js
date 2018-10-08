module.exports = controller => {
    const 
        app = controller.app,
        config = controller.config,
        accessTokens = controller.accessTokens,
        requestPromise = controller.requestPromise,
        nonces = controller.nonces;

    app.get(['/youtube/login'], (req, res) => {
        const 
            clientId = config.get('oauth2:CLIENT_ID'),
            responseType = 'code',
            redirectUri = `https://localhost:${config.get('PORT')}/youtube/oauth2callback`,
            scope = 'https://www.googleapis.com/auth/youtubepartner',
            state = nonces.create(60*10);

        parameters = `response_type=${responseType}&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
        res.cookie('State', state, { httpOnly: true });
        res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${parameters}`);
        res.send();
    });

    app.get(['/youtube/oauth2callback'], async (req, res) => {
        if(!req.query && !req.query.code) {
            res.send();
            return;
        }
        
        const cookieValid = req.cookies['State'] && nonces.has(req.cookies['State']);
        const stateValid = req.query && req.query.state && req.query.state == req.cookies['State'];

        if(!cookieValid || !stateValid) {
            res.send();
            return;
        }
        nonces.delete(req.cookies['State'])
        res.clearCookie('State');

        let requestOptions = {
            url: 'https://www.googleapis.com/oauth2/v4/token',
            method: 'POST',
            json: {
                code: req.query.code,
                client_id: config.get('oauth2:CLIENT_ID'),
                client_secret: config.get('oauth2:CLIENT_SECRET'),
                redirect_uri: `https://localhost:${config.get('PORT')}/youtube/oauth2callback`,
                grant_type: 'authorization_code'
            }
        }

        const body = await requestPromise(requestOptions);
        accessToken = body.access_token;

        expireTime = Math.min(body.expires_in-100, 10000);
        tokenKey = accessTokens.createAssociation(accessToken, expireTime);
        res.cookie('Session', tokenKey, { httpOnly: true });
        res.redirect('/');
        res.send();
    });
};