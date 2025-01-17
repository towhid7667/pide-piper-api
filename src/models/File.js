const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, required: true },
    size: { type: Number, default: 0 },
    path: String,
    parentFolder: { type: mongoose.Schema.Types.ObjectId, ref: 'File', default: null },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isFavorite: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('File', fileSchema);