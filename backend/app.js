const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

const user = [
    {id: 1, username: 'admin', password: 'admin123'},
]

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false
}));

//route
const authRoute = require('./routes/authRoute');
app.use('/auth', authRoute);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});