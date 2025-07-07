const path = require('path');
const jwtService = require('../service/jwtService');

exports.handleOAuthCallback = (req, res) => {
    const token = req.query.token;
    if (!token) {
        return res.status(400).send('Token is required');
    }

    const jwtUser = jwtService.decodeJWT(token);
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

exports.switchToJwt = (req, res) => {
    const jwtUser = jwtService.decodeJWT(req.session.pendingJwt);
    if (!jwtUser) {
        return res.status(401).send('Invalid switch request');
    }
    req.session.userId = jwtUser.sub;
    req.session.pendingJwt = null;
    res.status(200).send(`Switched to user: ${jwtUser.username}`);
}

exports.stayInternal = (req, res) => {
    const currentUser = req.session.userId;
    if (!currentUser) {
        return res.status(401).send('Unauthorized');
    }
    req.session.pendingJwt = null;
    res.status(200).send(`Staying logged in as user: ${currentUser}`);
}

exports.login = (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    // Simulate user authentication
    const user = { id: 1, username: 'admin', password: 'admin123' }; // Replace with real user lookup

    if (username === user.username && password === user.password) {
        req.session.userId = user.id;
        return res.status(200).send(`Logged in as ${user.username}`);
    } else {
        return res.status(401).send('Invalid credentials');
    }
}

exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Could not log out');
        }
        res.status(200).send('Logged out successfully');
    });
}