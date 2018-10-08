const crypto = require('crypto');

module.exports = () => {
    let tokens = {};
    let tokensProxy = new Proxy(tokens, { 
        get: (obj, prop) => {
            return obj[prop];
        },
        set: (_obj, _prop, _val) => {
            throw new Error('Cannot set authorization tokens externally.');
        },
        deleteProperty: (obj, prop) => {
            delete obj[prop];
        }
    });

    return {
        tokens: tokensProxy,
        createAssociation: (token, expiresIn) => {
            const key = crypto
                        .createHash('sha256')
                        .update(token)
                        .digest('base64');
            tokens[key] = token;
            setTimeout(() => {
                if(tokens[key])
                    delete tokens[key];
            }, expiresIn * 1000);
            return key;
        }
    };
};