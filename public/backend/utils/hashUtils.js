import crypto from 'crypto';

export function getHash(ts, publicKey, privateKey) {
    return crypto
        .createHash('md5')
        .update(ts + privateKey + publicKey)
        .digest('hex');
};