



const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    try {
        if (!req.headers.authorization) {
            return res.status(401).send({
                success: false,
                message: "Authorization header missing"
            });
        }

        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        console.log('Decoded token:', decoded); // Debugging: Log the decoded token

        req.userId = decoded.id;
        console.log('Set req.userId to:', req.userId); // Debugging: Log the userId being set
        console.log(req.user)

        next();
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(401).send({
            success: false,
            message: "Invalid Token"
        });
    }
};
