const crypto = require('crypto');

let nonces = new Set([]);

module.exports = () => {
    return {
        delete: (key) => {
            nonces.delete(key);
            return key;
        },
        has: (key) => {
            return nonces.has(key);
        },
        create: (expiresIn=60*10, key) => {
            const newKey = key == undefined ? 
                  crypto.randomBytes(20).toString('hex')
                : key;
            nonces.add(newKey);
            setTimeout(() => {
                nonces.delete(newKey);
            }, expiresIn * 1000);
            return newKey;
        }
    }
};