const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const Auth = require('../middleware/auth');
const sendEmail = require('../utils/mail');
const router = express.Router()

router.post('/register', async(req, res) => {
    // Create a new account
    try {
        const user = new User(req.body);
        user.double_authentification = { activated: false }
        await user.save();
        res.status(201).send({
            success: true,
            name: user.name,
            email: user.email,
            phone: user.phone,
            id: user._id
        });
    } catch (error) {
        res.status(400).send({ success: false, message : error });
    }
})

router.post('/login', async(req, res) => {
    //Login a registered user
    try {
        const { email, password, code } = req.body;
        if (!email) return res.status(400).send({ success: false, message: 'Missing email' });
        if (!password) return res.status(400).send({ success: false, message: 'Missing password' });

        const user = await User.findByCredentials(email, password);
        if (!user) return res.status(401).send({ success: false, message: 'Login failed! Check authentication credentials' });

        if (!user.verify_email || !user.verify_email.verified)
            return res.status(400).send({ success: false, message: 'Email address not verified' });

        if (user.verify_email && user.verify_email.verified && user.double_authentification && user.double_authentification.activated) {
            if (!code) return res.status(400).send({ success: false, message: 'Double authentification is activated, code is required' });
            const time = (Date.now() - user.double_authentification.date) / 1000;
            if (time > 600) return res.status(400).send({ success: false, message: 'Code is no longer valid' });
            if (user.double_authentification.code != code) {
                return res.status(400).send({ success: false, message: 'Wrong code' });
            }
        }

        const ret = await user.generateAccountJSON();
        ret.success = true;
        ret.token = await user.generateAuthToken();
        ret.refresh_token = await user.generateAuthRefreshToken();

        res.send(ret);
    } catch (error) {
        res.status(400).send({ success: false, message : error });
    }
})

router.post('/request-double-authentification', async(req, res) => {
    // Request code for double authentification
    try {
        const { email, password } = req.body;
        if (!email) return res.status(400).send({ success: false, message: 'Missing email' });
        if (!password) return res.status(400).send({ success: false, message: 'Missing password' });

        const user = await User.findByCredentials(email, password);
        if (!user) return res.status(401).send({ success: false, message: 'Login failed! Check authentication credentials' });

        if (!user.verify_email || !user.verify_email.verified)
            return res.status(400).send({ success: false, message: 'Email address not verified' });
        if (!await user.doubleAuthentification()) return res.status(400).send({ success: false });
        res.send({ success: true });
    } catch (error) {
        res.status(400).send({ success: false, message : error });
    }
})

router.post('/double-authentification', Auth.AuthentificationUser, async(req, res) => {
    // Change if double auth is active ou not
    try {
        const { allow } = req.body;
        const user = req.user;

        if (allow === undefined) return res.status(400).send({ success: false, message: 'Invalid body' });

        user.double_authentification = { activated: allow }
        await user.save();

        res.send({ success: true, activated: allow});
    } catch (error) {
        res.status(400).send({ success: false, message : error });
    }
})

router.post('/request-verify-email', async(req, res) => {
    // Login a registered user
    try {
        const { email } = req.body;
        if (!email) return res.status(400).send({ success: false, message: 'Invalid body' });

        const user = await User.findOne({ email: email });
        if (!user) return res.status(400).send({ success: false });
        const verify_email = await user.generateEmailVerifyCode();
        if (!verify_email) return res.status(500).send({ success: false, message: "Can't generate verify email code" });

        sendEmail(user.email, 'no-reply', user.name, verify_email.code);
        res.send({ success: true });
    } catch (error) {
        res.status(400).send({ success: false, message : error });
    }
})

router.post('/verify-email', async(req, res) => {
    // Verify email adress
    try {
        const { email, code } = req.body;
        if (!email || !code) return res.status(400).send({ success: false, message: 'Invalid body' });

        const user = await User.findOne({ email: email });
        if (!user) return res.status(400).send({ success: false });

        if (!user.verify_email || !user.verify_email.code || user.verify_email.verified) return res.status(400).send({ success: false, message: "This email is already verified" });

        const time = (Date.now() - user.verify_email.date) / 1000;
        if (time > 600) return res.status(400).send({ success: false, message: "Code is no longer valid" });

        if (user.verify_email.code !== code) return res.status(400).send({ success: false, message : "Wrong code" });

        user.verify_email.verified = true;
        user.verify_email.code = undefined;
        user.verify_email.date = undefined;
        await user.save();

        res.send({ success: true });
    } catch (error) {
        res.status(400).send({ success: false, message : error });
    }
})

router.get('/', Auth.AuthentificationUser, async(req, res) => {
    // View logged in user profile
    const user = req.user;

    const ret = await user.generateAccountJSON();
    ret.success = true;

    res.send(ret);
})

router.put('/', Auth.AuthentificationUser, async(req, res) => {
    // Edit user profile
    try {
        const user = req.user;

        const { email, name, phone, picture, password } = req.body;

        if (!password) return res.status(400).send({ success: false, message: 'Password missing' });
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) return res.status(400).send({ success: false, message: 'Invalid credentials' });

        if (email && email != user.email) {
            user.verify_email = undefined;
            user.double_authentification = undefined;
        }

        if (!email && !name && !phone && !picture) return res.status(400).send({ success: false, message: 'Invalid body' });
        if (email) user.email = email;
        if (picture) user.picture = picture;
        if (name) user.name = name;
        if (phone) user.phone = phone;

        await user.save();

        const ret = await user.generateAccountJSON();
        ret.success = true;

        res.send(ret);
    } catch (error) {
        res.status(400).send({ success: false, message : error });
    }
})

router.delete('/phone', Auth.AuthentificationUser, async(req, res) => {
    const user = req.user;

    user.phone = undefined;

    await user.save();

    res.send({ success: true });
});

router.post('/refresh-token', async(req, res) => {
    // Refresh Token
    try {
        const { id, refresh_token } = req.body;
        
        if (!id || !refresh_token ) return res.status(400).send({ success: false, message: 'Invalid body' });

        const user = await User.findOne({ _id: id });
        if (!user) return res.status(400).send({ success: false, message: 'Invalid id' });

        if (refresh_token !== user.refresh_token) return res.status(400).send({ success: false, message: 'Invalid token' });

        const ret = await user.generateAccountJSON();
        ret.success = true;
        ret.token = await user.generateAuthToken();
        ret.refresh_token = await user.generateAuthRefreshToken();
        res.send(ret);
    } catch (error) {
        res.status(400).send({ success: false, message : error });
    }
})

router.post('/request-reset-password', async(req, res) => {
    // Reset password with code
    try {
        const { email, type } = req.body;
        if (!email || !type) return res.status(400).send({ success: false, message: "Invalid body" });

        const user = await User.findOne({ email });
        if (!user) return res.status(400).send({ success: false });
        const reset_password = await user.generateResetPasswordCode();
        if (!reset_password) return res.status(500).send({ success: false, message: "Can't generate password code" });
        if (type === 'email') {
            sendEmail(user.email, 'no-reply', user.name, reset_password.code)
        }

        return res.status(200).send({ success: true });
    } catch (error) {
        res.status(400).send({ success: false, message : error });
    }
})

router.post('/reset-password', async(req, res) => {
    // Reset password with code
    try {
        const { email, code, password } = req.body;
        if (!email || !code || !password) return res.status(400).send({ success: false, message: "Invalid body" });

        const user = await User.findOne({ email });
        if (!user || !user.reset_password || !user.reset_password.code) return res.status(400).send({ success: false });

        const time = (Date.now() - user.reset_password.date) / 1000;
        if (time > 600) return res.status(400).send({ success: false, message: "Code is no longer valid" });

        if (user.reset_password.code != code) {
            user.reset_password = undefined;
            await user.save();
            return res.status(400).send({ success: false, message: "Code isn't valid" });
        }
        user.reset_password = undefined;
        if (!user.double_authentification) user.double_authentification.activated = false;
        user.password = password;
        await user.save();

        return res.status(200).send({ success: true });
    } catch (error) {
        res.status(400).send({ success: false, message : error });
    }
})

router.post('/change-password', Auth.AuthentificationUser, async(req, res) => {
    // Change password
    try {
        const { email, oldPassword, newPassword } = req.body;
        const user = req.user;
        if (!email || !oldPassword || !newPassword) return res.status(400).send({ success: false, message: "One field is missing" });

        const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordMatch) throw { success: false, message: "Old password is wrong" };
        if (email !== user.email) throw { success: false, message: "Email is wrong" };

        user.password = newPassword;
        await user.save();

        return res.status(200).send({ success: true });
    } catch (error) {
        res.status(400).send({ success: false, message : error });
    }
})

router.post('/avatar', Auth.AuthentificationUser, async(req, res) => {
    try {
        const user = req.user;
        const form = new IncomingForm({ multiples: false, uploadDir: 'uploads/avatars' });
        form.keepExtensions = true;
        let avatar;
        form
            .on('file', (field, file) => {
                if (file) avatar = file;
            })
            .on('end', async() => {
                if (avatar) {
                    if (user.avatar) fs.unlink(__basedir + __avatarPath + user.avatar, () => {});
                    user.avatar = avatar.path.replace(/^.*[\\\/]/, '');
                    await user.save();
                    return res.status(200).sendFile(__basedir + __avatarPath + user.avatar);
                } else return res.status(400).send({ success: false });
            })
        form.parse(req);
    } catch (error) {
        res.status(400).send({ success: false, message : error });
    }
})

router.get('/avatar', Auth.AuthentificationUser, async(req, res) => {
    try {
        const user = req.user;
        if (user.avatar) return res.status(200).sendFile(__basedir + __avatarPath + user.avatar);
        return res.status(400).send({ success: true });
    } catch (error) {
        res.status(400).send({ success: false, message : error });
    }
})

router.post('/disconnect', Auth.AuthentificationUser, async(req, res) => {
    // Log user out of the application
    try {
        req.user.token = undefined;
        req.user.refresh_token = undefined;

        await req.user.save();
        res.status(200).send({ success: true, message: 'Successfully logout' });
    } catch (error) {
        res.status(500).send({ success: false, message : error });
    }
})

        
router.delete('/', Auth.AuthentificationUser,  async(req, res) => {
    // Log user out of the application
    try {
        const { email } = req.body;
        let user = req.user;
        if (!user || !user._id || !email) return res.status(400).send({ success: false, message: 'Invalid credentials' });
        user = await User.findOne({ email: email });
        // if (user.avatar) fs.unlink(__basedir + __avatarPath + user.avatar, () => {});
        await User.deleteOne(user);
        res.status(200).send({ success: true, message: 'Successfully deleted' });
    } catch (error) {
        res.status(500).send({ success: false, message : error });
    }
})

module.exports = router;
