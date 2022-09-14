const mysql = require('mysql2');

// Database Connection using mysql2
const {
    DB_HOST_SECRET,
    DB_USER_SECRET,
    DB_PASSWORD_SECRET,
    DB_NAME_SECRET,
    DB_PORT_SECRET
} = process.env;

const db = mysql.createConnection({
    host: DB_HOST_SECRET,
    user: DB_USER_SECRET,
    password: DB_PASSWORD_SECRET,
    database: DB_NAME_SECRET,
    port: DB_PORT_SECRET
})

module.exports = db;