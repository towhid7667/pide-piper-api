// controllers/AuthController.js
const AuthService = require('../services/AuthService');

class AuthController {
    constructor() {
        this.authService = new AuthService();
    }

    register = async (req, res) => {
        try {
            const { name, email, password } = req.body;


            if (!name || !email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide all required fields'
                });
            }


            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide a valid email address'
                });
            }

            // Password strength validation
            if (password.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'Password must be at least 6 characters long'
                });
            }

            const user = await this.authService.register({ name, email, password });

            res.status(201).json({
                success: true,
                message: 'Registration successful. Please check your email for OTP verification.',
                data: {
                    userId: user._id,
                    email: user.email
                }
            });
        } catch (error) {
            if (error.code === 11000) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already registered'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Registration failed',
                error: error.message
            });
        }
    };

    verifyEmail = async (req, res) => {
        try {
            const { email, otp } = req.body;

            if (!email || !otp) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide email and OTP'
                });
            }

            const token = await this.authService.verifyEmail(email, otp);

            res.json({
                success: true,
                message: 'Email verified successfully',
                token
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    };

    login = async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide email and password'
                });
            }

            const token = await this.authService.login(email, password);

            res.json({
                success: true,
                message: 'Login successful',
                token
            });
        } catch (error) {
            res.status(401).json({
                success: false,
                message: error.message
            });
        }
    };

    googleSignIn = async (req, res) => {
        try {
            const { token } = req.body;

            if (!token) {
                return res.status(400).json({
                    success: false,
                    message: 'Google token is required'
                });
            }

            const authToken = await this.authService.googleSignIn(token);

            res.json({
                success: true,
                message: 'Google sign-in successful',
                token: authToken
            });
        } catch (error) {
            res.status(401).json({
                success: false,
                message: 'Google authentication failed',
                error: error.message
            });
        }
    };

    forgotPassword = async (req, res) => {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide email'
                });
            }

            await this.authService.forgotPassword(email);

            res.json({
                success: true,
                message: 'Password reset OTP sent to your email'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    };

    resetPassword = async (req, res) => {
        try {
            const { email, otp, newPassword } = req.body;

            if (!email || !otp || !newPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide email, OTP, and new password'
                });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'Password must be at least 6 characters long'
                });
            }

            await this.authService.resetPassword(email, otp, newPassword);

            res.json({
                success: true,
                message: 'Password reset successful'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    };

    updateProfile = async (req, res) => {
        try {
            const userId = req.user.id; // From auth middleware
            const { name, currentPassword, newPassword } = req.body;

            if (!name && !newPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide name or new password to update'
                });
            }

            if (newPassword && !currentPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password is required to change password'
                });
            }

            if (newPassword && newPassword.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'New password must be at least 6 characters long'
                });
            }

            const updatedUser = await this.authService.updateProfile(userId, {
                name,
                currentPassword,
                newPassword
            });

            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: {
                    name: updatedUser.name,
                    email: updatedUser.email
                }
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    };
}

module.exports = AuthController;