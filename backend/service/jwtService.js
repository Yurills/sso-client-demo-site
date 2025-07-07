const jwt = require('jsonwebtoken');

exports.decodeJWT = (token) => {
    try { 
        return jwt.decode(token);
    } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
    }
};