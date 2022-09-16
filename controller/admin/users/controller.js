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

// GET ALL USERS

router.get('/users', JWT.verifyAccessToken, (req, res) => {
    const sql = `SELECT user_id,first_name, middle_name, last_name, age, email, role
    FROM users`;

    db.query(sql, (err, rows) => {
        if (err) return console.log(err);
        res.status(200).json({ status: 200, message: `Successfully retrieve ( ${rows.length} records )`, data: rows })
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

        // CHECK IF ADMIN ROLE

        if (rows[0].role == 'User') return res.status(401).json({ status: 401, message: 'Unauthorized, Only administratior can login' })

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
        console.log(data.user_id)

        // error handling for invalid password
        if (!isValid) return res.status(400).json({ status: 400, message: 'Invalid password' });

        // function to get access token
        const accessToken = JWT.getAccessToken(data.user_id);

        // if no error send 200 response
        res.status(200).json({ status: 200, accessToken, message: 'Successfully login', data: data });

    })

})

// user Registration API

router.post('/user', JWT.verifyAccessToken, ifEmailExist, async(req, res) => {
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


// GET, UPDATE, DELETE SPECIFIC USER

router.route('/user/:user_id')
    .get(JWT.verifyAccessToken, (req, res) => {
        const sql = `SELECT user_id, first_name, middle_name, last_name, age, email, role
         FROM users where user_id = ?`;

        db.query(sql, req.params.user_id, (err, rows) => {
            if (err) return console.log(err);
            res.status(200).json({ status: 200, message: 'Successfully retrieved', data: rows })
        })
    })
    .put(JWT.verifyAccessToken, (req, res) => {
        if (!req.body.first_name || !req.body.last_name || !req.body.email)
            return res.status(422).json({ status: 422, message: 'Parameter Required ( first_name, last_name, email )' })

        const sql = `UPDATE users SET first_name = ?, middle_name = ?, last_name = ?, age = ?, email = ?, role = ? WHERE user_id = ?`;

        const values = [
            req.body.first_name,
            req.body.middle_name,
            req.body.last_name,
            req.body.age,
            req.body.email,
            req.body.role,
            req.params.user_id
        ]

        db.query(sql, values, (err, rows) => {
            if (err) return console.log(err);
            res.status(200).json({ status: 200, message: 'Successfully updated' })
        })

    })
    .delete(JWT.verifyAccessToken, (req, res) => {
        const sql = `DELETE FROM users where user_id = ?`;

        db.query(sql, req.params.user_id, (err, rows) => {
            if (err) return console.log(err);
            res.status(200).json({ status: 200, message: 'Successfully deleted' })
        })
    })

module.exports = router;