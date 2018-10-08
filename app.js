const 
    path = require('path'),
    config = require('./config/config.js'),
    express = require('express'),
    expressHandlebars = require('express-handlebars'),
    Handlebars = require('handlebars'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    https = require('https'),
    http = require('http'),
    fs = require('fs');

const app = express();

expressHandlebarsInstance = expressHandlebars({
    defaultLayout: 'template.hbs',
    layoutsDir: 'app/views/layouts',
    helpers: {
        configVariableFrom: function (config, variable) {
            config.get(variable) 
        },
        ifProduction: function (config, options) {
            if(config.get('NODE_ENV') === 'production')
                return options.fn(this);
            return options.inverse(this);
        },
        ifDevelopment: function (config, options) {
            if(config.get('NODE_ENV') === 'development')
                return options.fn(this);
            return options.inverse(this);
        },
        breakLines: function(text) {
            text = Handlebars.Utils.escapeExpression(text);
            text = text.trim().replace(/(\r\n|\n|\r)/gm, '<br>');
            return new Handlebars.SafeString(text);
        }
    }
});


app.set('views', path.join(__dirname, '/app/views'));
app.set('view engine', 'hbs');
app.engine('hbs', expressHandlebarsInstance);

app.use(express.static(config.get('STATIC_FILES')));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var httpServer = http.createServer(app);

if(config.get('NODE_ENV') == 'development') {
    var privateKey  = fs.readFileSync('ssl/server.key', 'utf8');
    var certificate = fs.readFileSync('ssl/server.crt', 'utf8');

    var credentials = {
        key: privateKey, 
        cert: certificate
    };
    
    var httpsServer = https.createServer(credentials, app);     
    httpsServer.listen(3002, (...data) => {
        console.log(`Listening securely on port 8443`)
    });
} else {
    httpServer.listen(config.get('PORT') || 3002, () => {
        console.log(`Listening on port ${config.get('PORT')}`);
    });
}

// app.listen(config.get('PORT') || 3002, () => {
//     console.log(`Listening on port ${config.get('PORT')}...`)
// });

const controller = require('./app/controller/controller.js')(app, config);
require('./app/controller/home.js')(controller);
require('./app/controller/youtube.js')(controller);
require('./app/controller/account.js')(controller);