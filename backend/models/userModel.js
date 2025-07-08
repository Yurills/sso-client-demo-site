import db from '../db/db.js';

export const createUser = ({ email, username, password }) => {
  const stmt = db.prepare(`INSERT INTO users (email, username, password) VALUES (?, ?, ?)`);
  const info = stmt.run(email, username, password);
  return info.lastInsertRowid;
};

export const findUserByEmail = (email) => {
  const stmt = db.prepare(`SELECT * FROM users WHERE email = ?`);
  return stmt.get(email); // returns row or undefined
};

export const findUserByUsername = (username) => {
  const stmt = db.prepare(`SELECT * FROM users WHERE username = ?`);
  return stmt.get(username);
};
