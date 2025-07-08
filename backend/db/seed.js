import db from './db.js';

const stmt = db.prepare(`INSERT INTO users (email, username, password) VALUES (?, ?, ?)`);

stmt.run('admin@admin.com', 'admin', 'admin123');

console.log('Users seeded successfully.');
