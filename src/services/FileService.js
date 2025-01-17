const File = require('../models/File');
const User = require('../models/User');
const fs = require('fs/promises');
const path = require('path');
const config = require('../config/config');

class FileService {
    constructor() {
        this.uploadsDir = path.join(__dirname, '../uploads');
    }

    async createFolder(name, parentId, userId) {
        try {
            const existingFolder = await File.findOne({
                name,
                parentFolder: parentId || null,
                owner: userId,
                type: 'folder',
                isDeleted: false
            });

            if (existingFolder) {
                throw new Error('Folder with this name already exists');
            }

            const folder = new File({
                name,
                type: 'folder',
                owner: userId,
                parentFolder: parentId || null
            });

            return await folder.save();
        } catch (error) {
            throw error;
        }
    }

    async uploadFile(file, parentId, userId) {
        try {
            const user = await User.findById(userId);
            const fileSize = file.size;


            if (user.storageUsed.total + fileSize > config.DEFAULT_STORAGE) {
                throw new Error('Storage limit exceeded');
            }


            const existingFile = await File.findOne({
                name: file.originalname,
                parentFolder: parentId || null,
                owner: userId,
                isDeleted: false
            });

            if (existingFile) {
                throw new Error('File with this name already exists');
            }
            const fileType = this.getFileType(file.mimetype);

            const fileDoc = new File({
                name: file.originalname,
                type: fileType,
                size: fileSize,
                path: file.path,
                owner: userId,
                parentFolder: parentId || null
            });

            await fileDoc.save();
            const storageUpdate = {
                $inc: {
                    'storageUsed.total': fileSize
                }
            };
            storageUpdate.$inc[`storageUsed.${fileType}s`] = fileSize;

            await User.findByIdAndUpdate(userId, storageUpdate);

            return fileDoc;
        } catch (error) {
            // Clean up uploaded file if error occurs
            if (file.path) {
                await fs.unlink(file.path).catch(() => {});
            }
            throw error;
        }
    }

    async getFilesList(userId, options = {}) {
        try {
            const query = {
                owner: userId,
                isDeleted: false
            };

            if (options.type) query.type = options.type;
            if (options.parentId) query.parentFolder = options.parentId;
            if (options.favorite) query.isFavorite = true;

            return await File.find(query)
                .sort({ type: 1, name: 1 })
                .populate('parentFolder', 'name');
        } catch (error) {
            throw error;
        }
    }

    async getRecentFiles(userId, limit = 10) {
        try {
            return await File.find({
                owner: userId,
                isDeleted: false,
                type: { $ne: 'folder' }
            })
                .sort({ createdAt: -1 })
                .limit(limit)
                .populate('parentFolder', 'name');
        } catch (error) {
            throw error;
        }
    }

    async getFavorites(userId) {
        try {
            return await File.find({
                owner: userId,
                isFavorite: true,
                isDeleted: false
            }).populate('parentFolder', 'name');
        } catch (error) {
            throw error;
        }
    }

    async toggleFavorite(fileId, userId) {
        try {
            const file = await File.findOne({
                _id: fileId,
                owner: userId,
                isDeleted: false
            });

            if (!file) {
                throw new Error('File not found');
            }

            file.isFavorite = !file.isFavorite;
            return await file.save();
        } catch (error) {
            throw error;
        }
    }

    async renameFile(fileId, newName, userId) {
        try {
            const file = await File.findOne({
                _id: fileId,
                owner: userId,
                isDeleted: false
            });

            if (!file) {
                throw new Error('File not found');
            }

            const existingFile = await File.findOne({
                name: newName,
                parentFolder: file.parentFolder,
                owner: userId,
                isDeleted: false,
                _id: { $ne: fileId }
            });

            if (existingFile) {
                throw new Error(`${file.type === 'folder' ? 'Folder' : 'File'} with this name already exists`);
            }

            file.name = newName;
            return await file.save();
        } catch (error) {
            throw error;
        }
    }

    async getStorageInfo(userId) {
        try {
            const user = await User.findById(userId);
            return {
                total: config.DEFAULT_STORAGE,
                used: user.storageUsed.total,
                available: config.DEFAULT_STORAGE - user.storageUsed.total,
                breakdown: {
                    images: user.storageUsed.images,
                    documents: user.storageUsed.documents,
                    pdfs: user.storageUsed.pdfs
                }
            };
        } catch (error) {
            throw error;
        }
    }

    async deleteFile(fileId, userId) {
        try {
            const file = await File.findOne({
                _id: fileId,
                owner: userId,
                isDeleted: false
            });

            if (!file) {
                throw new Error('File not found');
            }

            if (file.type === 'folder') {
                const containedFiles = await File.find({
                    parentFolder: fileId,
                    isDeleted: false
                });

                for (const containedFile of containedFiles) {
                    await this.deleteFile(containedFile._id, userId);
                }
            } else {
                const storageUpdate = {
                    $inc: {
                        'storageUsed.total': -file.size
                    }
                };
                storageUpdate.$inc[`storageUsed.${file.type}s`] = -file.size;

                await User.findByIdAndUpdate(userId, storageUpdate);

                if (file.path) {
                    await fs.unlink(file.path).catch(() => {});
                }
            }

            file.isDeleted = true;
            file.deletedAt = new Date();
            await file.save();

            return true;
        } catch (error) {
            throw error;
        }
    }

    getFileType(mimetype) {
        if (mimetype.startsWith('image/')) return 'image';
        if (mimetype === 'application/pdf') return 'pdf';
        return 'document';
    }
}

module.exports = FileService;