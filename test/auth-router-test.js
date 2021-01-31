const express = require('express');
const User = require('../src/models/User');

const router = express.Router()

router.get('/getVerifiedCode', async (req, res) => {
    // Get a list of all users
    try {
        const { email } = req.body;
        if (!email) return res.status(400).send({ success: false });

        const user = await User.findOne({ email: email });
        if (!user) return res.status(400).send({ success: false });

        const code = user.verify_email.code;        

        res.status(200).send({ success: true, code: code });
    } catch (error) {
        res.status(400).send({ success: false, message : error });
    }
})

router.get('/getVerifiedCodeResetPassword', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).send({ success: false });

        const user = await User.findOne({ email: email });
        if (!user) return res.status(400).send({ success: false });

        const code = user.reset_password.code;

        res.status(200).send({ success: true, code: code });
    } catch (error) {
        res.status(400).send({ success: false, message : error });
    }
})

router.get('/getVerifiedDoubleAuthentification', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).send({ success: false });

        const user = await User.findOne({ email: email });
        if (!user) return res.status(400).send({ success: false });

        const code = user.double_authentification.code;

        res.status(200).send({ success: true, code: code });
    } catch (error) {
        res.status(400).send({ success: false, message : error });
    }
})


module.exports = router;