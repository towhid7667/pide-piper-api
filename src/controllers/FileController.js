const FileService = require('../services/FileService');
const path = require('path');

class FileController {
    constructor() {
        this.fileService = new FileService();
    }

    createFolder = async (req, res) => {
        try {
            const { name, parentId } = req.body;
            const userId = req.user.id;

            if (!name) {
                return res.status(400).json({
                    success: false,
                    message: 'Folder name is required'
                });
            }

            const folder = await this.fileService.createFolder(name, parentId, userId);

            res.status(201).json({
                success: true,
                message: 'Folder created successfully',
                data: folder
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    };

    uploadFile = async (req, res) => {
        try {
            const { parentId } = req.body;
            const userId = req.user.id;
            const file = req.file;

            if (!file) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded'
                });
            }

            const uploadedFile = await this.fileService.uploadFile(file, parentId, userId);

            res.status(201).json({
                success: true,
                message: 'File uploaded successfully',
                data: uploadedFile
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    };

    getFilesList = async (req, res) => {
        try {
            const { type, parentId, favorite } = req.query;
            const userId = req.user.id;

            const files = await this.fileService.getFilesList(userId, {
                type,
                parentId,
                favorite: favorite === 'true'
            });

            res.json({
                success: true,
                data: files
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    };

    getRecentFiles = async (req, res) => {
        try {
            const userId = req.user.id;
            const { limit = 10 } = req.query;

            const files = await this.fileService.getRecentFiles(userId, parseInt(limit));

            res.json({
                success: true,
                data: files
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    };

    getFavorites = async (req, res) => {
        try {
            const userId = req.user.id;
            const favorites = await this.fileService.getFavorites(userId);

            res.json({
                success: true,
                data: favorites
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    };

    toggleFavorite = async (req, res) => {
        try {
            const fileId = req.params.id;
            const userId = req.user.id;

            const file = await this.fileService.toggleFavorite(fileId, userId);

            res.json({
                success: true,
                message: `File ${file.isFavorite ? 'added to' : 'removed from'} favorites`,
                data: file
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    };

    renameFile = async (req, res) => {
        try {
            const fileId = req.params.id;
            const { name } = req.body;
            const userId = req.user.id;

            if (!name) {
                return res.status(400).json({
                    success: false,
                    message: 'New name is required'
                });
            }

            const file = await this.fileService.renameFile(fileId, name, userId);

            res.json({
                success: true,
                message: 'File renamed successfully',
                data: file
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    };

    getStorageInfo = async (req, res) => {
        try {
            const userId = req.user.id;
            const storageInfo = await this.fileService.getStorageInfo(userId);

            res.json({
                success: true,
                data: storageInfo
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    };

    deleteFile = async (req, res) => {
        try {
            const fileId = req.params.id;
            const userId = req.user.id;

            await this.fileService.deleteFile(fileId, userId);

            res.json({
                success: true,
                message: 'File deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    };
}

module.exports = FileController;