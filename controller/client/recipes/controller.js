const express = require('express');
const router = express.Router();
const db = require('../../../database/database');
const JWT = require('../../jwt/JWT');

// router.get('/:keywords', async(req, res) => {
//     const { SECRET_API_ID, SECRET_API_KEY } = process.env;
//     console.log(SECRET_API_ID + " " + SECRET_API_KEY + req.params.keywords)
//     const response = await axios.get(`https://api.edamam.com/api/recipes/v2?type=public&q=${req.params.keywords}&app_id=${SECRET_API_ID}&app_key=${SECRET_API_KEY}`)
//     res.status(200).json(response.data)
// })

const ifRecipeExist = async(req, res, next) => {
    const sql = `SELECT * FROM favorite_recipes WHERE recipe_id = ? AND user_id = ?`;


    const favorite = [req.body.recipe_id, req.user];

    db.query(sql, favorite, (error, rows) => {

        if (error) return console.log(error)

        if (rows.length > 0) return res.status(409).json({ status: 409, message: 'Conflict, Recipe I.D already exist ' })

        next();
    })
}

// GET ALL FAVORITE RECIPES 

router.get('/favorite', JWT.verifyAccessToken, async(req, res) => {
    const sql = `SELECT recipe_id FROM favorite_recipes where user_id = ?`;

    db.query(sql, req.user, (error, rows) => {
        if (error) return console.log(error)
        res.status(200).json(rows)
    })

})

// ADD FAVORITE RECIPE

router.post('/favorite', JWT.verifyAccessToken, ifRecipeExist, async(req, res) => {
    const values = [req.user, req.body.recipe_id];

    const sql = `INSERT INTO favorite_recipes (user_id, recipe_id) values (?, ?)`;

    db.query(sql, values, (err, rows) => {
        if (err) return console.log(err)
        res.status(201).json({ rows });
    })

})

// REMOVE FAVORITE RECIPE

router.delete('/favorite', JWT.verifyAccessToken, async(req, res) => {
    const values = [req.user, req.query.recipe_id];

    const sql = `DELETE FROM favorite_recipes WHERE user_id = ? and recipe_id = ?`;

    db.query(sql, values, (err, rows) => {
        if (err) return console.log(err)
        res.status(200).json({ status: 200, message: `Successfully removed ${req.query.recipe_id}` });
    })

})

module.exports = router;