import jwt from 'jsonwebtoken';

export const decodeJWT = (token) => {
    try { 
        return jwt.decode(token);
    } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
    }
};

