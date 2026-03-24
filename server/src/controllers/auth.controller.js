const passport = require("passport");
const crypto = require("crypto");
const twilio = require("twilio");
const User = require("../models/user.model");
const Otp = require("../models/otp.model");
const {
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendEmailChangeConfirmationEmail,
    sendEmailChangeNotificationEmail,
    sendAccountReminderEmail,
} = require("../utils/email.service");

const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;
const EMAIL_CHANGE_TTL_MS = 60 * 60 * 1000;
const LOCAL_PHONE_EMAIL_SUFFIX = '@phone.login';

const serializeUserResponse = (user) => {
    if (!user) {
        return null;
    }

    const userObject = typeof user.toObject === 'function'
        ? user.toObject()
        : { ...user };

    delete userObject.password;
    delete userObject.emailVerificationToken;
    delete userObject.emailVerificationExpires;
    delete userObject.passwordResetToken;
    delete userObject.passwordResetExpires;
    delete userObject.emailChangeToken;
    delete userObject.emailChangeExpires;
    delete userObject.pendingEmail;
    return userObject;
};

const normalizeEmail = (email = '') => email.trim().toLowerCase();

const normalizePhone = (phone = '') => {
    const trimmed = phone.trim();
    if (!trimmed) {
        return '';
    }

    if (trimmed.startsWith('+')) {
        return `+${trimmed.slice(1).replace(/\D/g, '')}`;
    }

    const digits = trimmed.replace(/\D/g, '');
    if (digits.length === 10) {
        return `+91${digits}`;
    }

    return `+${digits}`;
};

const createTokenValue = () => crypto.randomBytes(32).toString('hex');
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
const createExpiringToken = (ttlMs) => {
    const rawToken = createTokenValue();
    return {
        rawToken,
        hashedToken: hashToken(rawToken),
        expiresAt: new Date(Date.now() + ttlMs)
    };
};

const assignEmailVerificationToken = (user) => {
    const token = createExpiringToken(EMAIL_VERIFICATION_TTL_MS);
    user.emailVerificationToken = token.hashedToken;
    user.emailVerificationExpires = token.expiresAt;
    return token.rawToken;
};

const assignPasswordResetToken = (user) => {
    const token = createExpiringToken(PASSWORD_RESET_TTL_MS);
    user.passwordResetToken = token.hashedToken;
    user.passwordResetExpires = token.expiresAt;
    return token.rawToken;
};

const assignEmailChangeToken = (user) => {
    const token = createExpiringToken(EMAIL_CHANGE_TTL_MS);
    user.emailChangeToken = token.hashedToken;
    user.emailChangeExpires = token.expiresAt;
    return token.rawToken;
};

const clearVerificationState = (user) => {
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
};

const clearPasswordResetState = (user) => {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
};

const clearEmailChangeState = (user) => {
    user.pendingEmail = undefined;
    user.emailChangeToken = undefined;
    user.emailChangeExpires = undefined;
};

const hasRealEmail = (user) => Boolean(user?.email) && !String(user.email).endsWith(LOCAL_PHONE_EMAIL_SUFFIX);

const maskEmail = (email) => {
    const [localPart = '', domain = ''] = String(email).split('@');
    if (!localPart || !domain) {
        return email;
    }

    const visibleLocal = localPart.length <= 2
        ? `${localPart[0] || ''}*`
        : `${localPart.slice(0, 2)}${'*'.repeat(Math.max(1, localPart.length - 2))}`;

    return `${visibleLocal}@${domain}`;
};

const ensureVerificationEmailSent = async (user) => {
    try {
        console.log(`[VERIFICATION EMAIL] Preparing to send verification email to ${user.email}...`);
        const rawToken = assignEmailVerificationToken(user);
        await user.save();
        console.log(`[VERIFICATION EMAIL] Token assigned and saved. Sending email...`);
        const result = await sendVerificationEmail(user, rawToken);
        console.log(`[VERIFICATION EMAIL] Result:`, result);
        return result;
    } catch (error) {
        console.error(`[VERIFICATION EMAIL ERROR] Failed to send verification email:`, error);
        console.error(`[VERIFICATION EMAIL ERROR] Stack:`, error.stack);
        throw error;
    }
};

// Initialize Twilio client conditionally
const twilioClient = (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_ACCOUNT_SID !== "your_twilio_sid") 
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN) 
    : null;

const getClientUrl = () => {
    const raw = (process.env.CLIENT_URL || "http://localhost:5173").trim();
    if (!raw) return "http://localhost:5173";
    const withProtocol = raw.startsWith("http://") || raw.startsWith("https://")
        ? raw
        : `https://${raw}`;

    try {
        const parsed = new URL(withProtocol);
        return `${parsed.protocol}//${parsed.host}`;
    } catch (_err) {
        return "http://localhost:5173";
    }
};

exports.register = async (req, res) => {
    try {
        const { name, email, password, phone, projectName } = req.body || {};
        if (!email || !password || !name) return res.status(400).json({ message: "Missing required fields" });
        if (String(password).length < 8) return res.status(400).json({ message: "Password must be at least 8 characters long" });

        const normalizedEmail = normalizeEmail(email);
        const normalizedPhone = phone ? normalizePhone(phone) : undefined;

        const exist = await User.findOne({ email: normalizedEmail });
        if (exist) return res.status(400).json({ message: "Email already used" });

        console.log(`[REGISTER] Creating user account for email: ${normalizedEmail}`);
        const user = await User.create({
            name,
            email: normalizedEmail,
            password,
            phone: normalizedPhone,
            projectName,
            emailVerified: false,
        });
        console.log(`[REGISTER] User created successfully: ${user._id}`);

        try {
            console.log(`[REGISTER] Sending verification email...`);
            await ensureVerificationEmailSent(user);
            console.log(`[REGISTER] Verification email sent successfully`);
        } catch (emailError) {
            console.error(`[REGISTER] Verification email failed but account was created:`, emailError.message);
            // Still return success - user can resend the email later
        }

        res.status(201).json({
            user: serializeUserResponse(user),
            requiresEmailVerification: true,
            message: "Account created. Please verify your email before signing in."
        });
    } catch (err) {
        console.error("[REGISTER] Register error:", err);
        console.error("[REGISTER] Stack:", err.stack);
        res.status(500).json({ 
            message: "Server error during registration",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body || {};
        if (!email || !password) return res.status(400).json({ message: "Missing credentials" });

        const user = await User.findOne({ email: normalizeEmail(email) });
        const isValidPassword = user ? await user.comparePassword(password) : false;

        if (!user || !isValidPassword) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        if (user.provider === 'local' && !user.emailVerified) {
            await ensureVerificationEmailSent(user);
            return res.status(403).json({
                message: "Please verify your email before signing in. A fresh verification link has been sent.",
                requiresEmailVerification: true,
                email: user.email
            });
        }

        if (user.hasLegacyPassword()) {
            user.password = password;
            await user.save();
        }

        req.login(user, (err) => {
            if (err) return res.status(500).json({ message: "Login error" });

            res.json({ user: serializeUserResponse(user) });
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.googleLogin = async (req, res) => {
    try {
        const { email, name, sub: googleId, picture: avatar } = req.body || {};
        if (!email) return res.status(400).json({ message: "Missing email" });

        let user = await User.findOne({ email: normalizeEmail(email) });
        if (!user) {
            user = await User.create({ name, email: normalizeEmail(email), googleId, avatar, provider: 'google', emailVerified: true });
        } else if (!user.googleId) {
            user.googleId = googleId;
            user.avatar = avatar || user.avatar;
            user.provider = 'google';
            user.emailVerified = true;
            await user.save();
        }

        req.login(user, (err) => {
            if (err) return res.status(500).json({ message: "Login error" });
            res.json({ user: serializeUserResponse(user) });
        });
    } catch (err) {
        console.error("Google login error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.googleCallback = (req, res, next) => {
    passport.authenticate("google", (err, user, info) => {
        if (err) {
            console.error("[Auth] Google Callback Error:", err);
            return res.status(500).json({ message: "Google auth failed", error: err.message });
        }
        if (!user) {
            return res.redirect(`${getClientUrl()}/login?error=failed`);
        }
        req.logIn(user, (err) => {
            if (err) return next(err);
            return res.redirect(getClientUrl());
        });
    })(req, res, next);
};

exports.facebookCallback = (req, res) => {
    res.redirect(getClientUrl());
};

exports.xCallback = (req, res) => {
    res.redirect(getClientUrl());
};

exports.loginSuccess = (req, res) => {
    if (req.user) {
        res.status(200).json({ success: true, user: serializeUserResponse(req.user) });
    } else {
        res.status(401).json({ success: false, message: "Not authenticated" });
    }
};

exports.loginFailure = (req, res) => {
    res.status(401).json({ success: false, message: "Login failed" });
};

exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect(getClientUrl());
    });
};

exports.updateProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        const { name, currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id);

        if (name) {
            user.name = name;
        }

        if (currentPassword && newPassword) {
            if (String(newPassword).length < 8) {
                return res.status(400).json({ message: "New password must be at least 8 characters long" });
            }

            const isValidPassword = await user.comparePassword(currentPassword);

            if (!isValidPassword) {
                return res.status(400).json({ message: "Invalid current password" });
            }

            user.password = newPassword;
        }

        await user.save();

        res.json({ user: serializeUserResponse(user) });
    } catch (err) {
        console.error("Update profile error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.resendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body || {};
        console.log(`[RESEND VERIFICATION] Request received for email:`, email);
        
        if (!email) {
            console.warn(`[RESEND VERIFICATION] No email provided in request`);
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        const user = await User.findOne({ email: normalizeEmail(email) });
        if (!user) {
            console.log(`[RESEND VERIFICATION] User not found for email: ${email}`);
            return res.json({ success: true, message: "If that account exists, a verification email has been sent." });
        }

        console.log(`[RESEND VERIFICATION] User found:`, user.email);

        if (user.emailVerified) {
            console.log(`[RESEND VERIFICATION] Email already verified for user: ${email}`);
            return res.json({ success: true, message: "That email address is already verified." });
        }

        console.log(`[RESEND VERIFICATION] Ensuring verification email is sent...`);
        await ensureVerificationEmailSent(user);
        
        console.log(`[RESEND VERIFICATION] SUCCESS - Verification email sent to ${email}`);
        return res.json({ success: true, message: "Verification email sent successfully." });
    } catch (err) {
        console.error(`[RESEND VERIFICATION ERROR] Exception occurred:`, err);
        console.error(`[RESEND VERIFICATION ERROR] Message:`, err.message);
        console.error(`[RESEND VERIFICATION ERROR] Stack:`, err.stack);
        return res.status(500).json({ 
            success: false,
            message: "Failed to resend verification email. Please ensure your email service is configured correctly.",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.body || {};
        if (!token) {
            return res.status(400).json({ message: "Verification token is required" });
        }

        const hashedToken = hashToken(token);
        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpires: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({ message: "Verification link is invalid or has expired" });
        }

        user.emailVerified = true;
        clearVerificationState(user);
        await user.save();

        return res.json({ success: true, message: "Email verified successfully. You can now sign in." });
    } catch (err) {
        console.error("Verify email error:", err);
        return res.status(500).json({ message: "Failed to verify email" });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body || {};
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email: normalizeEmail(email) });
        if (!user || !user.password) {
            return res.json({ success: true, message: "If that account exists, a password reset email has been sent." });
        }

        const rawToken = assignPasswordResetToken(user);
        await user.save();
        await sendPasswordResetEmail(user, rawToken);

        return res.json({ success: true, message: "If that account exists, a password reset email has been sent." });
    } catch (err) {
        console.error("Forgot password error:", err);
        return res.status(500).json({ message: "Failed to process password reset request" });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body || {};
        if (!token || !newPassword) {
            return res.status(400).json({ message: "Reset token and new password are required" });
        }

        if (String(newPassword).length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters long" });
        }

        const hashedToken = hashToken(token);
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({ message: "Password reset link is invalid or has expired" });
        }

        user.password = newPassword;
        clearPasswordResetState(user);
        await user.save();

        return res.json({ success: true, message: "Password reset successfully. You can now sign in." });
    } catch (err) {
        console.error("Reset password error:", err);
        return res.status(500).json({ message: "Failed to reset password" });
    }
};

exports.forgotEmail = async (req, res) => {
    try {
        const { phone } = req.body || {};
        if (!phone) {
            return res.status(400).json({ message: "Phone number is required" });
        }

        const normalizedPhone = normalizePhone(phone);
        const user = await User.findOne({ phone: normalizedPhone });

        if (!user || !hasRealEmail(user)) {
            return res.json({ success: true, message: "If a matching account exists, an email reminder has been sent." });
        }

        await sendAccountReminderEmail(user);

        return res.json({
            success: true,
            message: "We sent your account email to the email address on file.",
            maskedEmail: maskEmail(user.email)
        });
    } catch (err) {
        console.error("Forgot email error:", err);
        return res.status(500).json({ message: "Failed to process email reminder request" });
    }
};

exports.requestEmailChange = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        const { newEmail, currentPassword } = req.body || {};
        if (!newEmail) {
            return res.status(400).json({ message: "New email is required" });
        }

        const normalizedNewEmail = normalizeEmail(newEmail);
        const user = await User.findById(req.user._id);

        if (normalizedNewEmail === user.email) {
            return res.status(400).json({ message: "That is already your current email address" });
        }

        const emailOwner = await User.findOne({ email: normalizedNewEmail, _id: { $ne: user._id } });
        if (emailOwner) {
            return res.status(400).json({ message: "That email address is already in use" });
        }

        if (user.password) {
            if (!currentPassword) {
                return res.status(400).json({ message: "Current password is required to change email" });
            }

            const isValidPassword = await user.comparePassword(currentPassword);
            if (!isValidPassword) {
                return res.status(400).json({ message: "Invalid current password" });
            }
        }

        user.pendingEmail = normalizedNewEmail;
        const rawToken = assignEmailChangeToken(user);
        await user.save();

        await Promise.all([
            sendEmailChangeConfirmationEmail(user, normalizedNewEmail, rawToken),
            sendEmailChangeNotificationEmail(user, normalizedNewEmail)
        ]);

        return res.json({ success: true, message: "Check your new email inbox to confirm the address change." });
    } catch (err) {
        console.error("Request email change error:", err);
        return res.status(500).json({ message: "Failed to request email change" });
    }
};

exports.confirmEmailChange = async (req, res) => {
    try {
        const { token } = req.body || {};
        if (!token) {
            return res.status(400).json({ message: "Email change token is required" });
        }

        const hashedToken = hashToken(token);
        const user = await User.findOne({
            emailChangeToken: hashedToken,
            emailChangeExpires: { $gt: new Date() }
        });

        if (!user || !user.pendingEmail) {
            return res.status(400).json({ message: "Email change link is invalid or has expired" });
        }

        const emailOwner = await User.findOne({ email: user.pendingEmail, _id: { $ne: user._id } });
        if (emailOwner) {
            return res.status(400).json({ message: "That email address is already in use" });
        }

        user.email = user.pendingEmail;
        user.emailVerified = true;
        clearEmailChangeState(user);
        await user.save();

        return res.json({ success: true, message: "Email address updated successfully. Use the new email next time you sign in." });
    } catch (err) {
        console.error("Confirm email change error:", err);
        return res.status(500).json({ message: "Failed to confirm email change" });
    }
};





// --- Mobile OTP Authentication ---

exports.sendOtp = async (req, res) => {
    try {
        let { phone } = req.body;
        if (!phone) {
            return res.status(400).json({ message: "Phone number is required" });
        }

        phone = normalizePhone(phone);

        // Generate a random 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP to DB (TTL index will delete it after 5 minutes)
        await Otp.create({ phone, otp: otpCode });

        // Send OTP via SMS or fallback to console
        let devOtp = null;
        if (twilioClient) {
            await twilioClient.messages.create({
                body: `Your KHM Electronics login code is: ${otpCode}. It will expire in 5 minutes.`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: phone
            });
            console.log(`[OTP] SMS sent to ${phone}`);
        } else {
            // Dev mode: return OTP in response so frontend can display it
            devOtp = otpCode;
            console.log("-----------------------------------------");
            console.log(`[DEV OTP] Login Code for ${phone}: ${otpCode}`);
            console.log("-----------------------------------------");
        }

        res.json({ success: true, message: "OTP sent successfully", devOtp });
    } catch (err) {
        console.error("Send OTP error:", err);
        res.status(500).json({ message: "Failed to send OTP", error: err.message });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        let { phone, otp } = req.body;
        if (!phone || !otp) {
            return res.status(400).json({ message: "Phone and OTP are required" });
        }

        // Normalize phone to E.164 (same logic as sendOtp)
        phone = normalizePhone(phone);

        // Check if a matching, non-expired OTP exists
        const record = await Otp.findOne({ phone, otp });
        if (!record) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        // OTP is valid! Delete it so it can't be reused
        await Otp.deleteOne({ _id: record._id });

        // Check if user exists. If not, create an empty profile tied to this phone number
        let user = await User.findOne({ phone });
        if (!user) {
            // Check if phone was accidentally stored in the email field by old logic
            user = await User.findOne({ email: phone });
            if (!user) {
                user = await User.create({ 
                    name: "New User", 
                    phone: phone,
                    // If no email, we must generate a dummy one to satisfy schemas
                    email: `${phone.replace(/\D/g, '')}${LOCAL_PHONE_EMAIL_SUFFIX}`,
                    emailVerified: true,
                });
            }
        }

        // Establish passport session
        req.login(user, (err) => {
            if (err) return res.status(500).json({ message: "Login parsing error" });

            return res.json({ success: true, user: serializeUserResponse(user) });
        });

    } catch (err) {
        console.error("Verify OTP error:", err);
        res.status(500).json({ message: "Failed to verify OTP", error: err.message });
    }
};
