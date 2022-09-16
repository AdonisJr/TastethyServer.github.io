const jwt = require('jsonwebtoken');

exports.getAccessToken = (user_id) => {
    const user = { user_id: user_id }
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
    return accessToken
}

exports.verifyAccessToken = (req, res, next) => {
    let authHeader = null;
    if (req.headers.authorization) {
        authHeader = req.headers.authorization
    } else {
        authHeader = req.query.accessToken
    }

    const token = authHeader && authHeader.split(" ")[1]

    if (token == null) return res.status(401).json({ status: 401, message: 'Unauthorized, Authorization token not found, Please login first' })

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403).json({ status: 403, message: 'Forbidden, Invalid Access Token, Please login first' })
        req.user = user.user_id;
        next();
    })
}