const crypto = require('crypto');

module.exports = () => {
    let tokens = {};
    let tokensProxy = new Proxy(tokens, { 
        get: (obj, session) => {
            return obj[session];
        },
        set: (_obj, _session, _val) => {
            throw new Error('Cannot set csrf tokens externally.');
        }
    });

    return {
        tokens: tokensProxy,
        create: (session) => {
            const token = crypto
                        .createHash('sha256')
                        .update(session)
                        .digest('base64');
            tokens[session] = token;
            return token;
        }
    };
};