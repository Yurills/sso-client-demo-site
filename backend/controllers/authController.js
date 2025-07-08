import {decodeJWT} from '../service/jwtService.js';
import path from 'path';


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

    if (!currentUser) {
        req.session.userId = jwtUser.id; // Assuming jwtUser has an id property
    }

    if (currentUser === jwtUser.id) {
        return res.status(200).send(`Already logged in as, ${jwtUser.username}`);
    }

    //If conflict between current user and JWT user, prompt for session select.
    res.status(409).send('Session conflict detected. Please select a session.');
    req.session.pendingJwt = token;
    res.redirect("/auth/switch-session");
}

export const switchToJwt = (req, res) => {
    const jwtUser = jwtService.decodeJWT(req.session.pendingJwt);
    if (!jwtUser) {
        return res.status(401).send('Invalid switch request');
    }
    req.session.userId = jwtUser.sub;
    req.session.pendingJwt = null;
    res.status(200).send(`Switched to user: ${jwtUser.username}`);
}

export const stayInternal = (req, res) => {
    const currentUser = req.session.userId;
    if (!currentUser) {
        return res.status(401).send('Unauthorized');
    }
    req.session.pendingJwt = null;
    res.status(200).send(`Staying logged in as user: ${currentUser}`);
}

export const login = (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    // Simulate user authentication
    const user = { id: 1, username: 'admin', password: 'admin123', email: 'admin@example.com', name: 'Admin User' }; // Replace with real user lookup

    if (username === user.username && password === user.password) {
        req.session.userId = user.id;
        req.session.email = user.email;
        req.session.name = user.name || null; // Optional name field
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
