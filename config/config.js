/* 
    Please create your own secret.json. Path for oauth2 is oauth2:CLIENT_ID / oauth2:CLIENT_SECRET
    specifying port #'s and client ids
*/

const nconf = require('nconf');
nconf.argv().env();

const environment = nconf.get("NODE_ENV") || 'development';
nconf.file(environment, { file: __dirname + "/" + environment.toLowerCase() + ".json" });
nconf.file('secrets', { file: __dirname + "/secret.json" });
nconf.file('default', { file: __dirname + "/default.json" });

nconf.save(err => {
    console.log(err ? err : "Configuration set up successfully");
});

module.exports = nconf;