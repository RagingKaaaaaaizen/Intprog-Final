const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Op } = require('sequelize');
const config = require('../config.json');
const db = require('../_helpers/db');
const sendEmail = require('../_helpers/send-email');

module.exports = {
    authenticate,
    refreshToken,
    revokeToken,
    register,
    verifyEmail,
    getAll,
    getById,
    update,
    delete: _delete
};

async function authenticate({ email, password, ipAddress }) {
    const account = await db.Account.scope('withHash').findOne({ where: { email } });

    // Check if account exists
    if (!account) {
        throw 'Email or password is incorrect';
    }
    
    // Check if email is verified
    if (!account.verified) {
        // Generate a new verification token if needed
        if (!account.verificationToken) {
            account.verificationToken = randomTokenString();
            await account.save();
        }
        
        // Send a new verification email
        await sendVerificationEmail(account, ipAddress);
        
        throw 'Email not verified. Please check your email for verification instructions';
    }
    
    // Check if password is correct
    if (!(await bcrypt.compare(password, account.passwordHash))) {
        throw 'Email or password is incorrect';
    }

    // authentication successful so generate jwt and refresh tokens
    const jwtToken = generateJwtToken(account);
    const refreshToken = await generateRefreshToken(account, ipAddress);

    // return basic details and tokens
    return {
        ...basicDetails(account),
        jwtToken,
        refreshToken: refreshToken.token
    };
}

async function refreshToken({ token, ipAddress }) {
    const refreshToken = await getRefreshToken(token);
    const account = await refreshToken.getAccount();

    // replace old refresh token with a new one and save
    const newRefreshToken = await generateRefreshToken(account, ipAddress);
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    refreshToken.replacedByToken = newRefreshToken.token;
    await refreshToken.save();
    await newRefreshToken.save();

    // generate new jwt
    const jwtToken = generateJwtToken(account);

    // return basic details and tokens
    return {
        ...basicDetails(account),
        jwtToken,
        refreshToken: newRefreshToken.token
    };
}

async function revokeToken({ token, ipAddress }) {
    const refreshToken = await getRefreshToken(token);

    // revoke token and save
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    await refreshToken.save();
}

async function register(params, origin) {
    // validate
    if (await db.Account.findOne({ where: { email: params.email } })) {
        // send already registered error in email to prevent account enumeration
        await sendAlreadyRegisteredEmail(params.email, origin);
        return;
    }

    // create account object
    const account = new db.Account({
        ...params,
        role: params.role || 'User',
        passwordHash: await bcrypt.hash(params.password, 10),
        verificationToken: randomTokenString()
    });

    // save account
    await account.save();
    
    console.log(`
==============================================================
ACCOUNT REGISTERED!
Email: ${params.email}
Verification Token: ${account.verificationToken}
==============================================================
    `);

    // send email and return the email preview URL for frontend display
    const emailInfo = await sendVerificationEmail(account, origin);
    
    // Return verification token and email preview URL (if using Ethereal)
    return {
        message: "Registration successful, please verify your email",
        verificationToken: account.verificationToken,
        etherealPreviewUrl: emailInfo?.previewUrl || null
    };
}

async function verifyEmail({ token }) {
    const account = await db.Account.findOne({ where: { verificationToken: token } });

    if (!account) throw 'Verification failed. Invalid token.';

    account.verified = Date.now();
    account.verificationToken = null;
    await account.save();
    
    console.log(`
==============================================================
EMAIL VERIFIED SUCCESSFULLY!
Email: ${account.email}
Account is now verified and ready for login.
==============================================================
    `);
    
    return { message: 'Verification successful, you can now login' };
}

async function getAll() {
    const accounts = await db.Account.findAll();
    return accounts.map(x => basicDetails(x));
}

async function getById(id) {
    const account = await getAccount(id);
    return basicDetails(account);
}

async function update(id, params) {
    const account = await getAccount(id);

    // validate (if email was changed)
    if (params.email && account.email !== params.email && await db.Account.findOne({ where: { email: params.email } })) {
        throw 'Email "' + params.email + '" is already taken';
    }

    // hash password if it was entered
    if (params.password) {
        params.passwordHash = await bcrypt.hash(params.password, 10);
    }

    // copy params to account and save
    Object.assign(account, params);
    account.updated = Date.now();
    await account.save();

    return basicDetails(account);
}

async function _delete(id) {
    const account = await getAccount(id);
    await account.destroy();
}

// helper functions

async function getAccount(id) {
    const account = await db.Account.findByPk(id);
    if (!account) throw 'Account not found';
    return account;
}

async function getRefreshToken(token) {
    const refreshToken = await db.RefreshToken.findOne({ where: { token } });
    if (!refreshToken || !refreshToken.isActive) throw 'Invalid token';
    return refreshToken;
}

function generateJwtToken(account) {
    // create a jwt token containing the account id that expires in 15 minutes
    return jwt.sign({ id: account.id, role: account.role }, config.secret, { expiresIn: config.tokenExpiryTime });
}

async function generateRefreshToken(account, ipAddress) {
    // create a refresh token that expires in 7 days
    const token = randomTokenString();
    const expires = new Date(Date.now() + 7*24*60*60*1000);
    
    const refreshToken = new db.RefreshToken({
        token,
        expires,
        createdByIp: ipAddress
    });
    
    // link to account
    refreshToken.accountId = account.id;
    
    return refreshToken;
}

function randomTokenString() {
    return crypto.randomBytes(40).toString('hex');
}

function basicDetails(account) {
    const { id, firstName, lastName, email, role, created, updated, verified } = account;
    return { id, firstName, lastName, email, role, created, updated, verified };
}

async function sendVerificationEmail(account, origin) {
    let message;
    if (origin) {
        const verifyUrl = `${origin}/account/verify-email?token=${account.verificationToken}`;
        message = `<p>Please click the below link to verify your email address:</p>
                   <p><a href="${verifyUrl}">${verifyUrl}</a></p>
                   <p>Your verification token is: <strong>${account.verificationToken}</strong></p>`;
    } else {
        message = `<p>Please use the below token to verify your email address with the <code>/accounts/verify-email</code> api route:</p>
                   <p><code>${account.verificationToken}</code></p>`;
    }

    const emailInfo = await sendEmail({
        to: account.email,
        subject: 'Sign-up Verification - Verify Email',
        html: `<h4>Verify Email</h4>
               <p>Thanks for registering!</p>
               ${message}`
    });
    
    return emailInfo;
}

async function sendAlreadyRegisteredEmail(email, origin) {
    // Look up the account to get the verification status and token
    const account = await db.Account.findOne({ where: { email } });
    let verificationSection = '';
    
    // Check if account exists but is not verified
    if (account && !account.verified) {
        // Create a new verification token if needed
        if (!account.verificationToken) {
            account.verificationToken = randomTokenString();
            await account.save();
        }
        
        // Add verification instructions to the email
        const verifyUrl = origin 
            ? `${origin}/account/verify-email?token=${account.verificationToken}`
            : null;
            
        verificationSection = `
            <div style="margin-top: 20px; padding: 15px; border: 1px solid #d4edda; background-color: #d4edda; border-radius: 5px;">
                <h4 style="color: #155724;">Your Account Needs Verification</h4>
                <p>It appears you have registered but have not verified your email yet.</p>
                ${verifyUrl ? 
                    `<p>Please click this link to verify your email address:</p>
                    <p><a href="${verifyUrl}" style="display: inline-block; padding: 10px 15px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px;">${verifyUrl}</a></p>` 
                    :
                    `<p>Please use this token to verify your email address:</p>
                    <p style="padding: 10px; background-color: #f8f9fa; border-radius: 5px; font-family: monospace;">${account.verificationToken}</p>`
                }
            </div>`;
    }
    
    let passwordResetSection = '';
    if (origin) {
        passwordResetSection = `<p>If you don't know your password please visit the <a href="${origin}/account/forgot-password">forgot password</a> page.</p>`;
    } else {
        passwordResetSection = `<p>If you don't know your password you can reset it via the <code>/accounts/forgot-password</code> api route.</p>`;
    }

    await sendEmail({
        to: email,
        subject: 'Sign-up Verification - Email Already Registered',
        html: `<h4>Email Already Registered</h4>
               <p>Your email <strong>${email}</strong> is already registered.</p>
               ${passwordResetSection}
               ${verificationSection}`
    });
} 