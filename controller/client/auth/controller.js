const express = require('express');
const router = express.Router();
const db = require('../../../database/database');
const bcrypt = require('bcrypt');
const JWT = require('../../jwt/JWT');


// middleware function for checking email
const ifEmailExist = (req, res, next) => {

    const sql = `SELECT * FROM users where email = ?`;
    db.query(sql, req.body.email, (err, rows) => {

        if (err) return err.message

        if (rows.length == 0) return next();

        return res.status(409).json({ status: 409, message: 'Conflict, Email already exist' });

    })
}

// user Registration API

router.post('/register', ifEmailExist, async(req, res) => {
    // check if the required parameter are empty
    if (!req.body.first_name || !req.body.last_name || !req.body.email || !req.body.password)
        return res.status(422).json({ status: 422, message: 'Parameter Required ( first_name, last_name, email, password )' })

    // hash password usin bcrypt
    let hash = await bcrypt.hash(req.body.password, 13);

    const credentials = [
        req.body.first_name,
        req.body.middle_name,
        req.body.last_name,
        req.body.age,
        req.body.email,
        req.body.role,
        hash
    ]

    const sql = `INSERT INTO users (first_name, middle_name, last_name, age, email, role, password)
     VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.query(sql, credentials, (err, rows) => {
        if (err) {
            return console.log(err.message);
        }
        return res.status(201).json({ status: 201, message: 'Successfully created', data: rows });
    })

})

// User Authentication API

router.post('/login', (req, res) => {
    // check if the required parameter are empty
    if (!req.body.email || !req.body.password)
        return res.status(422).json({ status: 422, message: 'Parameter Required ( email, password )' })

    const Email = req.body.email;
    const Password = req.body.password;

    const sql = `SELECT * FROM users where email = ?`

    db.query(sql, Email, async(err, rows) => {
        if (err) return console.log(err.message)

        // error handling for invalid email address
        if (rows == 0) return res.status(400).json({ status: 400, message: 'Invalid email address' })

        const isValid = await bcrypt.compare(Password, rows[0].password)

        // data that will send if no error, password excluded for security purpose
        const data = {
            user_id: rows[0].user_id,
            first_name: rows[0].first_name,
            middle_name: rows[0].middle_name,
            last_name: rows[0].last_name,
            age: rows[0].age,
            email: rows[0].email,
            role: rows[0].role,
        };

        // error handling for invalid password
        if (!isValid) return res.status(400).json({ status: 400, message: 'Invalid password' });

        // function to get access token
        const accessToken = JWT.getAccessToken(data.user_id);

        // if no error send 200 response
        res.status(200).json({ status: 200, accessToken, message: 'Successfully login', data: data });

    })

})

// Get user information
// JWT.verifyAccessToken is a middleware use to verify accesstoken

router.get('/user', JWT.verifyAccessToken, (req, res) => {
    const sql = `SELECT user_id, first_name, middle_name, last_name, age, email, role from users 
            WHERE user_id = ?`

    db.query(sql, req.user, (err, rows) => {
        if (err) return err.message
        res.status(200).json({ data: rows[0] })
    })
})


module.exports = router;