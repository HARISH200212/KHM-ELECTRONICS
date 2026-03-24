const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const getClientUrl = () => {
    const raw = (process.env.CLIENT_URL || 'http://localhost:5173').trim();
    if (!raw) {
        return 'http://localhost:5173';
    }

    const withProtocol = raw.startsWith('http://') || raw.startsWith('https://')
        ? raw
        : `https://${raw}`;

    try {
        const parsed = new URL(withProtocol);
        return `${parsed.protocol}//${parsed.host}`;
    } catch (_error) {
        return 'http://localhost:5173';
    }
};

const senderAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER;

const buildTransportConfig = () => {
    const auth = {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    };

    if (process.env.EMAIL_SERVICE) {
        return {
            service: process.env.EMAIL_SERVICE,
            auth,
            tls: {
                rejectUnauthorized: false
            }
        };
    }

    return {
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT || 587),
        secure: String(process.env.EMAIL_PORT || '587') === '465',
        auth,
        tls: {
            rejectUnauthorized: false
        }
    };
};

const transporter = nodemailer.createTransport(buildTransportConfig());

const getOrderId = (order = {}) => {
    const raw = order._id || order.id;
    return raw ? String(raw) : `ORD-${Date.now()}`;
};

const getOrderTotal = (order = {}) => {
    if (Number.isFinite(Number(order.totalAmount))) return Number(order.totalAmount);
    if (Number.isFinite(Number(order.total))) return Number(order.total);
    return (order.items || []).reduce((sum, item) => {
        const price = Number(item?.price || 0);
        const qty = Number(item?.quantity || 1);
        return sum + (price * qty);
    }, 0);
};

const isEmailConfigured = () => {
    return Boolean(senderAddress && process.env.EMAIL_PASS && (process.env.EMAIL_SERVICE || process.env.EMAIL_HOST));
};

const saveFallbackEmail = (fileName, html) => {
    const fallbackPath = path.join(__dirname, '..', '..', fileName);
    fs.writeFileSync(fallbackPath, html);
    return fallbackPath;
};

const sendMailWithFallback = async ({ mailOptions, fallbackFileName, html, logLabel }) => {
    if (!isEmailConfigured()) {
        const fallbackPath = saveFallbackEmail(fallbackFileName, html);
        console.error(`[Email ERROR] ${logLabel} not sent to ${mailOptions.to}. Email service NOT CONFIGURED.`);
        console.error(`[Email DEBUG] EMAIL_FROM: ${senderAddress}, EMAIL_HOST: ${process.env.EMAIL_HOST}, EMAIL_USER: ${process.env.EMAIL_USER}`);
        console.error(`[Email] Preview saved to ${fallbackPath}`);
        return { delivered: false, fallbackPath };
    }

    try {
        console.log(`[Email] Attempting to send ${logLabel} to ${mailOptions.to}...`);
        const info = await transporter.sendMail(mailOptions);
        console.log(`[Email SUCCESS] ${logLabel} sent to ${mailOptions.to}`);
        console.log(`[Email] Message ID: ${info.messageId}`);
        return { delivered: true, messageId: info.messageId };
    } catch (error) {
        console.error(`[Email FAILED] ${logLabel} failed to send to ${mailOptions.to}`);
        console.error(`[Email] Error details:`, error);
        console.error(`[Email] Error message: ${error.message}`);
        console.error(`[Email] Error code: ${error.code}`);
        if (error.response) {
            console.error(`[Email] SMTP Response: ${error.response}`);
        }
        const fallbackPath = saveFallbackEmail(fallbackFileName, html);
        console.warn(`[Email] Preview saved to ${fallbackPath}`);
        return { delivered: false, fallbackPath, error: error.message };
    }
};

const buildActionUrl = (action, token) => `${getClientUrl()}/auth/action?action=${encodeURIComponent(action)}&token=${encodeURIComponent(token)}`;

const renderActionEmail = ({ heading, intro, actionLabel, actionUrl, outro, accent = '#dc2626' }) => `
    <div style="font-family: Arial, Helvetica, sans-serif; background-color: #f8fafc; padding: 40px 20px; color: #111827;">
        <div style="max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);">
            <div style="padding: 28px 32px; background: linear-gradient(135deg, ${accent} 0%, #991b1b 100%); color: #ffffff;">
                <h1 style="margin: 0; font-size: 24px; font-weight: 800;">${heading}</h1>
            </div>
            <div style="padding: 32px; line-height: 1.7; font-size: 15px; color: #374151;">
                <p style="margin-top: 0;">${intro}</p>
                <div style="margin: 28px 0; text-align: center;">
                    <a href="${actionUrl}" style="display: inline-block; background: ${accent}; color: #ffffff; text-decoration: none; font-weight: 700; padding: 14px 22px; border-radius: 10px;">${actionLabel}</a>
                </div>
                <p>If the button does not work, copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: ${accent};">${actionUrl}</p>
                <p style="margin-bottom: 0;">${outro}</p>
            </div>
        </div>
    </div>
`;

const sendVerificationEmail = async (user, rawToken) => {
    const actionUrl = buildActionUrl('verify-email', rawToken);
    const html = renderActionEmail({
        heading: 'Verify Your Email',
        intro: `Hello ${user.name || 'there'}, please confirm your email address to activate your KHM Electronics account.`,
        actionLabel: 'Verify Email',
        actionUrl,
        outro: 'This verification link expires in 24 hours. If you did not create this account, you can ignore this email.'
    });

    return sendMailWithFallback({
        mailOptions: {
            from: senderAddress,
            to: user.email,
            subject: 'Verify your KHM Electronics email',
            html,
        },
        fallbackFileName: 'latest-email-verification.html',
        html,
        logLabel: 'Email verification'
    });
};

const sendPasswordResetEmail = async (user, rawToken) => {
    const actionUrl = buildActionUrl('reset-password', rawToken);
    const html = renderActionEmail({
        heading: 'Reset Your Password',
        intro: `Hello ${user.name || 'there'}, we received a request to reset the password for your KHM Electronics account.`,
        actionLabel: 'Reset Password',
        actionUrl,
        outro: 'This password reset link expires in 1 hour. If you did not request this, you can ignore this email.'
    });

    return sendMailWithFallback({
        mailOptions: {
            from: senderAddress,
            to: user.email,
            subject: 'Reset your KHM Electronics password',
            html,
        },
        fallbackFileName: 'latest-password-reset.html',
        html,
        logLabel: 'Password reset'
    });
};

const sendEmailChangeConfirmationEmail = async (user, newEmail, rawToken) => {
    const actionUrl = buildActionUrl('confirm-email-change', rawToken);
    const html = renderActionEmail({
        heading: 'Confirm Your New Email',
        intro: `Hello ${user.name || 'there'}, confirm that you want to change your KHM Electronics email address to ${newEmail}.`,
        actionLabel: 'Confirm Email Change',
        actionUrl,
        outro: 'This email change link expires in 1 hour. If you did not request this, you can ignore this message.'
    });

    return sendMailWithFallback({
        mailOptions: {
            from: senderAddress,
            to: newEmail,
            subject: 'Confirm your new KHM Electronics email',
            html,
        },
        fallbackFileName: 'latest-email-change-confirmation.html',
        html,
        logLabel: 'Email change confirmation'
    });
};

const sendEmailChangeNotificationEmail = async (user, newEmail) => {
    if (!user.email) {
        return { delivered: false };
    }

    const html = renderActionEmail({
        heading: 'Email Change Requested',
        intro: `Hello ${user.name || 'there'}, a request was made to change your KHM Electronics email address from ${user.email} to ${newEmail}.`,
        actionLabel: 'Open Account',
        actionUrl: `${getClientUrl()}/settings`,
        outro: 'If this was not you, reset your password immediately and contact support.',
        accent: '#2563eb'
    });

    return sendMailWithFallback({
        mailOptions: {
            from: senderAddress,
            to: user.email,
            subject: 'KHM Electronics email change requested',
            html,
        },
        fallbackFileName: 'latest-email-change-notice.html',
        html,
        logLabel: 'Email change notice'
    });
};

const sendAccountReminderEmail = async (user) => {
    const html = renderActionEmail({
        heading: 'Your Account Email',
        intro: `Hello ${user.name || 'there'}, this email was requested as a reminder for the email address linked to your KHM Electronics account.`,
        actionLabel: 'Open Login',
        actionUrl: `${getClientUrl()}/login`,
        outro: `Your account email is ${user.email}. If you did not request this reminder, you can safely ignore this message.`,
        accent: '#059669'
    });

    return sendMailWithFallback({
        mailOptions: {
            from: senderAddress,
            to: user.email,
            subject: 'Your KHM Electronics account email',
            html,
        },
        fallbackFileName: 'latest-account-reminder.html',
        html,
        logLabel: 'Account reminder'
    });
};

const sendOrderConfirmation = async (user, order) => {
    try {
        console.log(`\n[ORDER EMAIL] Starting order confirmation email process...`);
        console.log(`[ORDER EMAIL] For user:`, { email: user?.email, name: user?.name });
        console.log(`[ORDER EMAIL] Order ID: ${order?._id || order?.id}`);
        
        if (!user || !user.email) {
            console.error(`[ORDER EMAIL ERROR] Missing user or user email. User:`, user);
            throw new Error('User object or email is missing');
        }

        if (!isEmailConfigured()) {
            throw new Error('Email service is not configured. Set EMAIL_HOST, EMAIL_USER and EMAIL_PASS.');
        }

        const orderId = getOrderId(order);
        const totalAmount = getOrderTotal(order);
        const orderSuffix = orderId.slice(-6).toUpperCase();
        const trackingSuffix = orderId.slice(-8).toUpperCase();

        const mailOptions = {
            from: senderAddress,
            to: user.email,
            bcc: process.env.EMAIL_USER, // Send copy to the store owner's given email address
            subject: `Order Confirmation - #${orderSuffix}`,
            html: `
            <div style="font-family: Arial, Helvetica, sans-serif; background-color: #f0f0f0; padding: 40px 20px; text-align: center;">
                <div style="background-color: #ffffff; max-width: 800px; margin: 0 auto; padding: 40px; text-align: left; color: #111; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                    
                    <!-- Header -->
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px;">
                        <div>
                            <h1 style="font-size: 36px; font-weight: 900; line-height: 1.1; color: #1a202c; letter-spacing: 1px; margin: 0;">PRINTABLE<br/>INVOICE</h1>
                        </div>
                        <div style="text-align: right;">
                            <a href="${getClientUrl()}/orders" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 25px; border-radius: 4px; font-weight: bold; font-size: 14px;">TRACK ORDER</a>
                        </div>
                    </div>

                    <!-- Company Details -->
                    <table width="100%" style="font-size: 13px; margin-bottom: 20px;" cellpadding="0" cellspacing="0">
                        <tr>
                            <td width="50%" valign="top">
                                <div style="margin-bottom: 6px;"><strong style="display: inline-block; width: 140px;">Company:</strong> <span style="color: #333;">KH ELECTRONICS</span></div>
                                <div style="margin-bottom: 6px;"><strong style="display: inline-block; width: 140px;">Address:</strong> <span style="color: #333;">123 Tech Park</span></div>
                                <div style="margin-bottom: 6px;"><strong style="display: inline-block; width: 140px;">PostCode / City:</strong> <span style="color: #333;">560001 Bangalore</span></div>
                                <div style="margin-bottom: 6px;"><strong style="display: inline-block; width: 140px;">Location:</strong> <span style="color: #333;">India</span></div>
                                <div style="margin-bottom: 6px;"><strong style="display: inline-block; width: 140px;">Sender Name:</strong> <span style="color: #333;">KH Admin</span></div>
                            </td>
                            <td width="50%" valign="top">
                                <div style="margin-bottom: 6px;"><strong style="display: inline-block; width: 140px;">Telephone / E-mail:</strong> <span style="color: #333;">+91 9876543210</span></div>
                                <div style="margin-bottom: 6px;"><strong style="display: inline-block; width: 140px;">Shipping Date:</strong> <span style="color: #333;">${new Date().toLocaleDateString('en-IN')}</span></div>
                                <div style="margin-bottom: 6px;"><strong style="display: inline-block; width: 140px;">Tracking Number:</strong> <span style="color: #333; font-family: monospace; font-weight: bold;">KHM-${trackingSuffix}</span></div>
                                <div style="margin-bottom: 6px;"><strong style="display: inline-block; width: 140px;">Sender VAT Number:</strong> <span style="color: #333;">29XXXXX1234X1Z5</span></div>
                            </td>
                        </tr>
                    </table>

                    <hr style="border: none; border-top: 2px solid #2d3748; margin: 25px 0;">

                    <!-- Bill To & Order Details -->
                    <table width="100%" style="font-size: 13px; margin-bottom: 20px;" cellpadding="0" cellspacing="0">
                        <tr>
                            <td width="50%" valign="top">
                                <strong style="display: block; margin-bottom: 10px;">Send To</strong>
                                <div style="margin-bottom: 4px;"><strong style="display: inline-block; width: 140px;">Receiver Name:</strong> <span style="color: #333;">${user.name || 'Valued Customer'}</span></div>
                                <div style="margin-bottom: 4px;"><strong style="display: inline-block; width: 140px;">Address:</strong> <span style="color: #333;">${order.shippingAddress?.address || order.customer?.address || 'N/A'}</span></div>
                                <div style="margin-bottom: 4px;"><strong style="display: inline-block; width: 140px;">Location:</strong> <span style="color: #333;">India</span></div>
                                <div style="margin-bottom: 4px;"><strong style="display: inline-block; width: 140px;">Telephone / E-mail:</strong> <span style="color: #333;">${user.email}</span></div>
                                <div style="margin-bottom: 4px;"><strong style="display: inline-block; width: 140px;">Receiver VAT Number:</strong> <span style="color: #333;">-</span></div>
                            </td>
                            <td width="50%" valign="top" align="right">
                                <div style="margin-bottom: 6px;"><strong style="margin-right: 15px;">Invoice Number</strong> <span style="color: #333;">INV-${orderSuffix}</span></div>
                                <div style="margin-bottom: 6px;"><strong style="margin-right: 15px;">Date</strong> <span style="color: #333;">${new Date(order.createdAt || new Date()).toLocaleDateString('en-IN')}</span></div>
                                <div style="margin-bottom: 6px;"><strong style="margin-right: 15px;">Order Number</strong> <span style="color: #333;">${orderId}</span></div>
                                <div style="margin-bottom: 6px;"><strong>Country of Origin</strong></div>
                                <div style="margin-bottom: 6px;"><strong>Country of destination</strong></div>
                                <div style="margin-bottom: 6px;"><strong>Terms of Payment</strong></div>
                                <div style="margin-bottom: 6px;"><strong>Bill of Lading</strong></div>
                            </td>
                        </tr>
                    </table>

                    <!-- Items Table -->
                    <table width="100%" style="font-size: 13px; border-collapse: collapse; margin-top: 40px; border: 1px solid #e2e8f0;" cellpadding="12">
                        <thead>
                            <tr style="background-color: #f7fafc;">
                                <th style="border: 1px solid #e2e8f0; text-align: left; width: 55%; color: #1a202c;">Description</th>
                                <th style="border: 1px solid #e2e8f0; text-align: left; width: 15%; color: #1a202c;">Quantity</th>
                                <th style="border: 1px solid #e2e8f0; text-align: left; width: 15%; color: #1a202c;">Unit price</th>
                                <th style="border: 1px solid #e2e8f0; text-align: left; width: 15%; color: #1a202c;">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${(order.items || []).map(item => `
                                <tr>
                                    <td style="border: 1px solid #e2e8f0;">${item.name || item.product?.name || 'Item'}</td>
                                    <td style="border: 1px solid #e2e8f0;">${item.quantity}</td>
                                    <td style="border: 1px solid #e2e8f0;">₹${Number(item.price).toLocaleString('en-IN')}</td>
                                    <td style="border: 1px solid #e2e8f0;">₹${(Number(item.price) * item.quantity).toLocaleString('en-IN')}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <!-- Totals -->
                    <table width="300" style="font-size: 13px; margin-top: 20px; float: right;" cellpadding="8">
                        <tr>
                            <td style="border-bottom: 1px solid #e2e8f0;"><strong>Subtotal</strong></td>
                            <td style="border-bottom: 1px solid #e2e8f0; text-align: right; color: #333;">₹${(totalAmount / 1.18).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                        </tr>
                        <tr>
                            <td style="border-bottom: 1px solid #e2e8f0;"><strong>Discount (0%)</strong></td>
                            <td style="border-bottom: 1px solid #e2e8f0; text-align: right; color: #333;">₹0.00</td>
                        </tr>
                        <tr>
                            <td style="border-bottom: 1px solid #e2e8f0;"><strong>Tax 1 (18% GST)</strong></td>
                            <td style="border-bottom: 1px solid #e2e8f0; text-align: right; color: #333;">₹${(totalAmount - (totalAmount / 1.18)).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                        </tr>
                        <tr>
                            <td style="border-bottom: 2px solid #2d3748; font-size: 15px;"><strong>Total</strong></td>
                            <td style="border-bottom: 2px solid #2d3748; text-align: right; color: #333; font-size: 15px; font-weight: bold;">₹${totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                        </tr>
                    </table>
                    <div style="clear: both;"></div>

                    <!-- Footer -->
                    <div style="margin-top: 60px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                        <span style="font-size: 24px; font-weight: 800; color: #1a202c;">📦 Online<span style="color: #48bb78;">Invoices</span></span>
                    </div>
                </div>
            </div>
            `,
        };

        const result = await sendMailWithFallback({
            mailOptions,
            fallbackFileName: 'latest-order-invoice.html',
            html: mailOptions.html,
            logLabel: 'Order confirmation'
        });

        console.log(`[ORDER EMAIL] Confirmation email result:`, result);
        return result;
    } catch (err) {
        console.error(`[ORDER EMAIL EXCEPTION] Unexpected error generating order email template:`, err);
        console.error(`[ORDER EMAIL EXCEPTION] Stack:`, err.stack);
        throw err;
    }
};

const sendContactEmail = async ({ name, email, subject, message }) => {
    try {
        const mailOptions = {
            from: senderAddress,
            to: process.env.EMAIL_USER,
            replyTo: email,
            subject: `Contact Form: ${subject || 'New Inquiry'} from ${name} `,
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #e0e0e0;">
                    <div style="background-color: #7e57c2; padding: 20px; text-align: left;">
                        <h2 style="margin: 0; color: #ffffff;">New Contact Form Submission</h2>
                    </div>
                    <div style="padding: 20px;">
                        <p><strong>Name:</strong> ${name}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Subject:</strong> ${subject || 'N/A'}</p>
                        <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #7e57c2;">
                            <p style="margin: 0; white-space: pre-wrap;">${message}</p>
                        </div>
                    </div>
                </div>
    `,
        };

        await sendMailWithFallback({
            mailOptions,
            fallbackFileName: 'latest-contact-email.html',
            html: mailOptions.html,
            logLabel: 'Contact form'
        });
    } catch (error) {
        console.error('Error sending contact email:', error);
    }
};

const sendStatusUpdateEmail = async (user, order) => {
    try {
        const mailOptions = {
            from: senderAddress,
            to: user.email,
            subject: `Update on your Order - #${order.id || order._id}`,
            html: `
            <div style="font-family: Arial, Helvetica, sans-serif; background-color: #f0f0f0; padding: 40px 20px; text-align: center;">
                <div style="background-color: #ffffff; max-width: 600px; margin: 0 auto; padding: 40px; text-align: left; color: #111; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                    <h2 style="color: #4f46e5; margin-top: 0;">Order Status Update</h2>
                    <p style="font-size: 16px;">Hello ${user.name || 'Customer'},</p>
                    <p style="font-size: 16px;">The status for your order <strong>#${order.id || order._id}</strong> has been updated to:</p>
                    <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
                        <strong style="font-size: 20px; color: #1a202c;">${order.status}</strong>
                    </div>
                    <p style="font-size: 16px;">You can track the progress of your order using the button below:</p>
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="${getClientUrl()}/orders" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 25px; border-radius: 4px; font-weight: bold; font-size: 14px;">VIEW MY ORDERS</a>
                    </div>
                </div>
            </div>
            `,
        };

        await sendMailWithFallback({
            mailOptions,
            fallbackFileName: 'latest-status-update.html',
            html: mailOptions.html,
            logLabel: 'Order status update'
        });
    } catch (err) {
        console.error('Unexpected error generating status email template:', err);
    }
};

const sendDailySummaryEmail = async (stats) => {
    try {
        const mailOptions = {
            from: senderAddress,
            to: process.env.EMAIL_USER,
            subject: `Daily Business Summary - ${new Date().toLocaleDateString('en-IN')}`,
            html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; padding: 40px 20px; color: #1e293b;">
                <div style="background-color: #ffffff; max-width: 700px; margin: 0 auto; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 30px; text-align: center; color: white;">
                        <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1px;">KHM <span style="color: #fbbf24;">ELECTRONICS</span></h1>
                        <p style="margin: 10px 0 0 0; opacity: 0.8; font-size: 14px;">Daily Business Performance Report</p>
                    </div>

                    <div style="padding: 40px;">
                        <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 25px; border-bottom: 2px solid #fbbf24; display: inline-block; padding-bottom: 5px;">Performance Overview</h2>
                        
                        <!-- Stats Grid -->
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
                            <div style="background-color: #f1f5f9; padding: 20px; border-radius: 12px; text-align: center;">
                                <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase;">Total Revenue</p>
                                <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: 800; color: #0f172a;">₹${stats.totalRevenue.toLocaleString('en-IN')}</p>
                            </div>
                            <div style="background-color: #f1f5f9; padding: 20px; border-radius: 12px; text-align: center;">
                                <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase;">Orders Placed</p>
                                <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: 800; color: #0f172a;">${stats.orderCount}</p>
                            </div>
                        </div>

                        <div style="background-color: #f1f5f9; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 40px;">
                            <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase;">Items Sold</p>
                            <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: 800; color: #0f172a;">${stats.itemCount}</p>
                        </div>

                        <!-- Top Selling Products -->
                        <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 15px;">Recent Orders Snapshot</h3>
                        <table width="100%" style="border-collapse: collapse; font-size: 14px;">
                            <thead>
                                <tr style="background-color: #f8fafc; text-align: left;">
                                    <th style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Customer</th>
                                    <th style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #64748b;">Items</th>
                                    <th style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #64748b; text-align: right;">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${stats.recentOrders.slice(0, 5).map(order => `
                                    <tr>
                                        <td style="padding: 12px; border-bottom: 1px solid #f1f5f9;">${order.customer?.name || 'Customer'}</td>
                                        <td style="padding: 12px; border-bottom: 1px solid #f1f5f9;">${order.items?.length || 0} items</td>
                                        <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 600;">₹${order.total.toLocaleString('en-IN')}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>

                        <div style="margin-top: 40px; text-align: center;">
                            <a href="${getClientUrl()}/admin" style="display: inline-block; background-color: #0f172a; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">GO TO ADMIN DASHBOARD</a>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
                        <p style="margin: 0;">&copy; ${new Date().getFullYear()} KHM Electronics. All rights reserved.</p>
                        <p style="margin: 5px 0 0 0;">This is an automated system report.</p>
                    </div>
                </div>
            </div>
            `,
        };

        await sendMailWithFallback({
            mailOptions,
            fallbackFileName: 'latest-daily-summary.html',
            html: mailOptions.html,
            logLabel: 'Daily summary'
        });
    } catch (err) {
        console.error('Unexpected error generating daily summary email template:', err);
    }
};

module.exports = {
    sendOrderConfirmation,
    sendContactEmail,
    sendStatusUpdateEmail,
    sendDailySummaryEmail,
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendEmailChangeConfirmationEmail,
    sendEmailChangeNotificationEmail,
    sendAccountReminderEmail,
    isEmailConfigured,
};

