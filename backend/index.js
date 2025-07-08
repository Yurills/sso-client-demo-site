import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        sameSite: 'lax',
    }
}));

//serve frontend
const frontendDistPath = path.join(__dirname, '../dist');
app.use(express.static(frontendDistPath));

//route
import authRoute from './routes/authRoute.js';
app.use('/api/auth', authRoute);

// app.get("*", (req, res) => {
//     res.sendFile(path.join(frontendDistPath, '../index.html'));
// });


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});