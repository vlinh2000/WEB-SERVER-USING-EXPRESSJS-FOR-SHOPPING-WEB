const jwt = require('jsonwebtoken');
const secret = process.env.SECRET;

let isAuth = async (req, res, next) => {
    const tokenFromClient = req.headers['x-access-token'];
    if (tokenFromClient) {
        try {
            const decoded = await jwt.verify(tokenFromClient, secret);
            req.jwtDecoded = decoded;
        } catch (error) {
            return res.status(401).json({
                message: 'Unauthorized.',
            })
        }
        next();
    }
    else {
        // Không tìm thấy token trong request
        return res.status(403).send({
            message: 'No token provided.',
        });
    }
}
module.exports = { isAuth: isAuth }
