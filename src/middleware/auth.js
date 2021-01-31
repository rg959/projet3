const jwt = require('jsonwebtoken')
const User = require('../models/User')

const AuthentificationUser = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const data = jwt.verify(token, process.env.JWT_KEY);
        const user = await User.findOne({ _id: data._id, token: token });
        if (!user) throw { success: false, message: 'Not authorized to access this resource' };

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        if (error.name == 'TokenExpiredError') return res.status(401).send({ success: false, message: 'Expired Token' });
        res.status(401).send({ success: false, message: 'Not authorized to access this resource' });
    }
}

var Auth = {
    AuthentificationUser: AuthentificationUser,
};

module.exports = Auth;