module.exports = controller => {
    const 
        app = controller.app,
        requestPromise = controller.requestPromise;

    app.get(['/', '/home', '/home/index'], (req, res) => {
        res.render('home/index.hbs', { pagetitle: 'Home' });
    });

    app.get(['/home/descriptions'], async (req, res) => {
        const accessToken = controller.getAccessToken(req);

        if(!res.locals.user.isAuthenticated || !accessToken) {
            res.redirect('/');
            res.send();
            return;
        }

        parameters = `mine=true&part=snippet&mine=true&access_token=${accessToken}&maxResults=25`;
        requestOptions = {
            url: `https://www.googleapis.com/youtube/v3/subscriptions?${parameters}`,
            method: 'GET'
        };
        let body = JSON.parse(
            await requestPromise(requestOptions)
        );
        res.render('home/descriptions.hbs', { pagetitle: 'Descriptions', descriptions: body.items })
    });
};