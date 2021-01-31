const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const sendEmail = require('../utils/mail');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'User name required'],
        validate: value => {
            if (value.length > 55) throw { success: false, message: 'Invalid name : Too long' }
        }
    },
    email: {
        type: String,
        required: [true, 'User email required'],
        unique: true,
        lowercase: true,
        validate: value => {
            if (!validator.isEmail(value)) throw { success: false, message: 'Invalid Email address' }
            // if (value.length > 100) throw { success: false, message: 'Your password must contains less than 100 characters' }
        }
    },
    password: {
        type: String,
        required: [true, 'User password required']
    },
    phone: {
        type: String,
        validate: value => {
            if (!validator.isMobilePhone(value)) throw { success: false, message: 'Invalid phone number' }
        }
    },
    token: {
        type: String
    },
    refresh_token: {
        type: String
    },
    reset_password: {
        code: {
            type: String
        },
        date: {
            type: Number
        }
    },
    double_authentification: {
        activated: {
            type: Boolean
        },
        code: {
            type: String
        },
        date: {
            type: Number
        }
    },
    verify_email: { // Also use when email is changed        
        code: {
            type: String
        },
        date: {
            type: Number
        },
        verified: {
            type: Boolean
        }
    },
    avatar: {
        type: String
    },
    connexionDate: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true })

function genCodeDate() {
    return {
        date: Date.now(),
        code: between(100000, 999999)
    };
}

function between(min, max) {
    return Math.floor(
        Math.random() * (max - min + 1) + min
    )
}

userSchema.pre('save', async function (next) {
    // Hash the password before saving the user model
    const user = this;
    if (user.isModified('password')) {
        if (user.password.length < 7) throw { success: false, message: 'Your password must contains at least 7 characters' }
        if (user.password.length >= 18) throw { success: false, message: 'Your password must contains less than 18 characters' }
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
})

userSchema.methods.generateAuthToken = async function () {
    // Generate an auth token for the user
    const user = this;
    user.token = await jwt.sign({ _id: user._id }, process.env.JWT_KEY, { expiresIn: '96h' /*'15m'*/ });
    user.connexionDate = Date.now();
    await user.save(); // time to 1h
    return user.token;
}

userSchema.methods.generateAuthRefreshToken = async function () {
    // Generate an auth refresh token for the user
    const user = this;
    user.refresh_token = await jwt.sign({ _id: user._id }, process.env.JWT_KEY);
    user.connexionDate = Date.now();
    await user.save();
    return user.refresh_token;
}

userSchema.methods.generateResetPasswordCode = async function () {
    const user = this;

    user.reset_password = genCodeDate();
    await user.save();
    return user.reset_password;
}

userSchema.methods.generateEmailVerifyCode = async function () {
    const user = this;

    if (user.verify_email && user.verify_email.verified) return false;

    user.verify_email = genCodeDate();
    await user.save();
    return user.verify_email;
}

userSchema.methods.doubleAuthentification = async function () {
    const user = this;
    const activated = user.double_authentification.activated;
    user.double_authentification = genCodeDate();
    user.double_authentification.activated = activated;
    await user.save();

    sendEmail(user.email, 'no-reply', user.name, user.double_authentification.code)

    return user.double_authentification;
}

userSchema.methods.resetDoubleAuthentification = async function () {
    const user = this;

    user.double_authentification.code = undefined;
    user.double_authentification.date = undefined;
    await user.save();
}

userSchema.methods.generateJSON = async function () {
    const user = this;

    const ret = {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        connexionDate: user.connexionDate,
        createdAt: user.createdAt,
        hasAvatar: user.avatar && user.avatar !== ''
    }
    return ret;
}

userSchema.methods.generateAccountJSON = async function () {
    const user = this;
    const ret = await user.generateJSON();
    if (user.double_authentification && user.double_authentification.activated) ret.double_authentification = true;
    return ret;
}

userSchema.statics.findByCredentials = async (email, password) => {
    // Search for a user by email and password.
    const user = await User.findOne({ email });
    if (!user) {
        throw { success: false, message: "Invalid login credentials" };
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
        throw { success: false, message: "Invalid login credentials" };
    }
    return user;
}

const User = mongoose.model('user', userSchema);

module.exports = User;
