const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    isVerified: { type: Boolean, default: false },
    verificationOTP: String,
    otpExpiry: Date,
    googleId: String,
    storageUsed: {
        total: { type: Number, default: 0 },
        images: { type: Number, default: 0 },
        documents: { type: Number, default: 0 },
        pdfs: { type: Number, default: 0 }
    },
    resetPasswordToken: String,
    resetPasswordExpiry: Date
}, { timestamps: true });

userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

module.exports = mongoose.model('User', userSchema);