// services/AuthService.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const config = require('../config/config');

class AuthService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: config.SMTP_HOST,
            port: config.SMTP_PORT,
            secure: config.SMTP_PORT === 465,
            auth: {
                user: config.SMTP_USER,
                pass: config.SMTP_PASS
            }
        });

        this.googleClient = new OAuth2Client(config.GOOGLE_CLIENT_ID);
    }

    async register(userData) {
        try {
            const existingUser = await User.findOne({ email: userData.email });
            if (existingUser) {
                throw new Error('Email already registered');
            }

            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const otpExpiry = new Date();
            otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP valid for 10 minutes

            const user = new User({
                name: userData.name,
                email: userData.email,
                password: userData.password,
                verificationOTP: otp,
                otpExpiry
            });

            await user.save();

            await this.sendVerificationEmail(user.email, otp);

            return user;
        } catch (error) {
            throw error;
        }
    }

    async verifyEmail(email, otp) {
        try {
            const user = await User.findOne({
                email,
                verificationOTP: otp,
                otpExpiry: { $gt: new Date() },
                isVerified: false
            });

            if (!user) {
                throw new Error('Invalid or expired OTP');
            }

            user.isVerified = true;
            user.verificationOTP = undefined;
            user.otpExpiry = undefined;
            await user.save();

            return this.generateToken(user);
        } catch (error) {
            throw error;
        }
    }

    async login(email, password) {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                throw new Error('Invalid email or password');
            }

            if (!user.isVerified) {
                throw new Error('Email not verified');
            }

            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                throw new Error('Invalid email or password');
            }

            return this.generateToken(user);
        } catch (error) {
            throw error;
        }
    }

    async googleSignIn(token) {
        try {
            const ticket = await this.googleClient.verifyIdToken({
                idToken: token,
                audience: config.GOOGLE_CLIENT_ID
            });

            const payload = ticket.getPayload();
            const { email, name, sub: googleId } = payload;

            let user = await User.findOne({ email });

            if (!user) {
                user = new User({
                    email,
                    name,
                    googleId,
                    isVerified: true
                });
                await user.save();
            } else if (!user.googleId) {
                user.googleId = googleId;
                await user.save();
            }

            return this.generateToken(user);
        } catch (error) {
            throw new Error('Google authentication failed');
        }
    }

    async forgotPassword(email) {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                throw new Error('User not found');
            }

            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const otpExpiry = new Date();
            otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);

            user.resetPasswordOTP = otp;
            user.resetPasswordExpiry = otpExpiry;
            await user.save();
            await this.sendPasswordResetEmail(email, otp);
        } catch (error) {
            throw error;
        }
    }

    async resetPassword(email, otp, newPassword) {
        try {
            const user = await User.findOne({
                email,
                resetPasswordOTP: otp,
                resetPasswordExpiry: { $gt: new Date() }
            });

            if (!user) {
                throw new Error('Invalid or expired OTP');
            }

            user.password = newPassword;
            user.resetPasswordOTP = undefined;
            user.resetPasswordExpiry = undefined;
            await user.save();
        } catch (error) {
            throw error;
        }
    }

    async updateProfile(userId, updateData) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            if (updateData.name) {
                user.name = updateData.name;
            }

            if (updateData.newPassword) {
                const isValidPassword = await bcrypt.compare(
                    updateData.currentPassword,
                    user.password
                );

                if (!isValidPassword) {
                    throw new Error('Current password is incorrect');
                }

                user.password = updateData.newPassword;
            }

            await user.save();
            return user;
        } catch (error) {
            throw error;
        }
    }

    generateToken(user) {
        return jwt.sign(
            { id: user._id },
            config.JWT_SECRET,
            { expiresIn: '7d' }
        );
    }

    async sendVerificationEmail(email, otp) {
        try {
            await this.transporter.sendMail({
                from: config.SMTP_USER,
                to: email,
                subject: 'Email Verification',
                html: `
                    <h1>Email Verification</h1>
                    <p>Your verification code is: <strong>${otp}</strong></p>
                    <p>This code will expire in 10 minutes.</p>
                    <p>If you didn't request this verification, please ignore this email.</p>
                `
            });
        } catch (error) {
            throw new Error('Failed to send verification email');
        }
    }

    async sendPasswordResetEmail(email, otp) {
        try {
            await this.transporter.sendMail({
                from: config.SMTP_USER,
                to: email,
                subject: 'Password Reset Request',
                html: `
                    <h1>Password Reset</h1>
                    <p>Your password reset code is: <strong>${otp}</strong></p>
                    <p>This code will expire in 10 minutes.</p>
                    <p>If you didn't request this password reset, please ignore this email.</p>
                `
            });
        } catch (error) {
            throw new Error('Failed to send password reset email');
        }
    }
}

module.exports = AuthService;