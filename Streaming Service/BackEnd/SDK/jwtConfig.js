var jwt = require('jsonwebtoken');

var secret = 'RPU<Yzdf.)KqD}xs6+/?^K`fs9mPWsH[()ta(X#$'; //Change Secret Key to Company's choice
var expiresIn = 86400; //Change expiration time

function generateToken(payload) {
    return jwt.sign( payload, secret, {expiresIn});
}

function verifytoken(token) {
    try {
        return jwt.verify(token, secret);
    } catch (err) {
        return null;
    }
}

module.exports = {
    generateToken: generateToken,
    verifytoken: verifytoken,
};
