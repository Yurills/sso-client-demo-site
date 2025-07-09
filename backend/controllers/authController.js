import {decodeJWT} from '../service/jwtService.js';
import path from 'path';
import { findUserByUsername } from '../models/userModel.js';


export const handleOAuthCallback = (req, res) => {
    const token = req.query.token;
    if (!token) {
        return res.status(400).send('Token is required');
    }

    const jwtUser = decodeJWT(token);
    if (!jwtUser) {
        return res.status(401).send('Invalid token');
    }

    // Continue with the authenticated user
    const currentUser = req.session.userId;

    //
    if (!currentUser) {
        req.session.userId = jwtUser.sub; // Assuming jwtUser has an id property
        req.session.email = jwtUser.email || null; // Optional email field
        req.session.name = jwtUser.name || null; // Optional name field

        return res.status(200).send({
            conflict: false,
            user: {
                id: jwtUser.sub,
                email: jwtUser.email || null, // Optional email field
                name: jwtUser.name || jwtUser.preferred_username || null // Optional name field
            }
        });

    }

    if (currentUser === jwtUser.sub) {
        
        return res.status(200).send({
            conflict: false,
            user: {
                id: jwtUser.sub,
                email: jwtUser.email || null, // Optional email field
                name: jwtUser.name || jwtUser.preferred_username || null // Optional name field
            }
        });
    }
    // console.log(currentUser + " : " + jwtUser.sub);


    //If conflict between current user and JWT user, prompt for session select.
    // res.status(409).send('Session conflict detected. Please select a session.');
    req.session.pendingJwt = token;
    return res.status(409).json({
        conflict: true,
        currentUser: {
            id: currentUser,
            email: req.session.email || null, // Optional email field
            name: req.session.name || null // Optional name field
        },
        incomingUser: {
            id: jwtUser.sub,
            email: jwtUser.email || null, // Optional email field
            name: jwtUser.name || jwtUser.preferred_username || null // Optional name field
        }
    })
}

export const switchToJwt = (req, res) => {
    const jwtUser = decodeJWT(req.session.pendingJwt);
    if (!jwtUser) {
        return res.status(401).send('Invalid switch request');
    }
    req.session.userId = jwtUser.sub;
    req.session.email = jwtUser.email || null; // Optional email field
    req.session.name = jwtUser.name || null; // Optional name field
    req.session.pendingJwt = null;
    res.status(200).send({
        success: true,
        message: 'Switched to JWT session successfully',
        user: {
            id: jwtUser.sub,
            email: jwtUser.email || null,
            name: jwtUser.name || jwtUser.preferred_username || null
        }
    });
}

export const stayInternal = (req, res) => {
    const currentUser = req.session.userId;
    if (!currentUser) {
        return res.status(401).send('Unauthorized');
    }
    req.session.pendingJwt = null;
    res.status(200).send({
        success: true,
        message: `Staying logged in as user: ${currentUser}`,
        user: {
            id: currentUser,
            email: req.session.email || null, // Optional email field
            name: req.session.name || null // Optional name field
        }
    });
}

export const login = (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    // Simulate user authentication
    const user = findUserByUsername(username);

    if (!user) {
        return res.status(404).send('User not found');
    }

    if (password === user.password) {
        req.session.userId = user.id;
        req.session.email = user.email;
        req.session.name = user.name || user.username || null; // Optional name field
        return res.status(200).send(`Logged in as ${user.username}`);
    } else {
        return res.status(401).send('Invalid credentials');
    }
}

export const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Could not log out');
        }
        res.status(200).send('Logged out successfully');
    });
}

export const checkInternalSession = (req, res) => {
    if (req.session.userId) {
        res.status(200).json({
            loggedIn: true,
            user: {
                id: req.session.userId,
                email: req.session.email || null,
                name: req.session.name || null
            },
            method: 'internal'
        })
    } else {
        res.status(401).json({
            loggedIn: false,})
    }
}

const authController = {
    handleOAuthCallback,
    switchToJwt,
    stayInternal,
    login,
    logout,
    checkInternalSession
};

export default authController;
