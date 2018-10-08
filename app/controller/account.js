module.exports = (controller) => {
    const 
        app = controller.app,
        accessTokens = controller.accessTokens,
        csrfTokens = controller.csrfTokens;

    const verifyCsrf = (req, res) => {
        if(req.headers['x-csrf-token'] && req.cookies['Session']) {
            if(req.headers['x-csrf-token'] != csrfTokens.tokens[req.cookies['Session']]) {
                res.status(401);
                res.send();
                return false;
            }
        }
        return true;
    };

    app.get(['/account', '/account/profile'], (req, res) => {
        res.render('account/profile.hbs', { pagetitle: 'Your Profile' });
    });

    app.get(['/account/logout'], (req, res) => {
        res.render('account/logout.hbs');
    });

    app.post(['/account/logout'], (req, res) => {
        if (!verifyCsrf(req, res))
            return;

        if(req.cookies['Session'] && accessTokens.tokens[req.cookies['Session']]) {
            delete accessTokens.tokens[req.cookies['Session']];
            res.clearCookie('Session');
            res.status(200);
        } else {
            res.status(401);
        }
        res.send();
    });
};