const express = require('express');
const router = express.Router();

router.use('/', require('./auth/controller'))
router.use('/recipes', require('./recipes/controller'))

module.exports = router;