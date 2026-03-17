const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const BCRYPT_HASH_PATTERN = /^\$2[aby]\$\d{2}\$.{53}$/;
const SALT_ROUNDS = 10;

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        // Optional because Google Auth users won't have a password
    },
    avatar: {
        type: String
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    provider: {
        type: String,
        default: 'local'
    },
    googleId: {
        type: String
    },
    facebookId: {
        type: String
    },
    twitterId: {
        type: String
    },
    phone: {
        type: String
    },
    projectName: {
        type: String
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: {
        type: String
    },
    emailVerificationExpires: {
        type: Date
    },
    passwordResetToken: {
        type: String
    },
    passwordResetExpires: {
        type: Date
    },
    pendingEmail: {
        type: String,
        lowercase: true,
        trim: true
    },
    emailChangeToken: {
        type: String
    },
    emailChangeExpires: {
        type: Date
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

userSchema.virtual('isAdmin').get(function () {
    return this.role === 'admin';
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) {
        return false;
    }

    if (BCRYPT_HASH_PATTERN.test(this.password)) {
        return bcrypt.compare(candidatePassword, this.password);
    }

    return this.password === candidatePassword;
};

userSchema.methods.hasLegacyPassword = function () {
    return Boolean(this.password) && !BCRYPT_HASH_PATTERN.test(this.password);
};

userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password || BCRYPT_HASH_PATTERN.test(this.password)) {
        return next();
    }

    try {
        this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model('User', userSchema);
