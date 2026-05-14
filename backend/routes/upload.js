const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { auth } = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { getSafeErrorMessage, sanitizeMessage } = require('../utils/errorSanitizer');

// Validate Cloudinary configuration at startup
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
    console.error('[CLOUDINARY] Missing required environment variables:',
        !cloudName ? 'CLOUDINARY_CLOUD_NAME' : '',
        !apiKey ? 'CLOUDINARY_API_KEY' : '',
        !apiSecret ? 'CLOUDINARY_API_SECRET' : ''
    );
}

// Configure Cloudinary
cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
});

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        // Get file extension
        const ext = path.extname(file.originalname).toLowerCase().substring(1); // Remove the dot
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        
        return {
            folder: 'conference-papers',
            allowed_formats: ['pdf', 'doc', 'docx'],
            resource_type: 'raw',
            public_id: `paper-${uniqueSuffix}`,
            format: ext // Explicitly set the format to preserve extension
        };
    }
});

// File filter - only allow certain file types
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF, DOC, and DOCX files are allowed'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// All upload routes require authentication
router.use(auth);

/**
 * @route   POST /api/upload/paper
 * @desc    Upload a paper file
 * @access  Private
 */
router.post('/paper', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        // Cloudinary returns the file URL in req.file.path
        // This is a publicly accessible URL that persists permanently
        const fileUrl = req.file.path;

        res.json({
            success: true,
            message: 'File uploaded successfully',
            data: {
                filename: req.file.filename,
                originalname: req.file.originalname,
                fileUrl, // This is now the Cloudinary URL
                size: req.file.size,
                mimetype: req.file.mimetype,
                cloudinaryId: req.file.filename // Store this if you need to delete later
            }
        });
    } catch (error) {
        console.error('File upload error:', error);
        res.status(500).json({
            success: false,
            message: getSafeErrorMessage(error, 'Error uploading file')
        });
    }
});

// Error handling for multer
router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size is 10MB'
            });
        }
        return res.status(400).json({
            success: false,
            message: getSafeErrorMessage(err, 'File upload error')
        });
    }
    if (err) {
        // Sanitize the error message to prevent leaking sensitive data
        // (e.g., Cloudinary API keys in error responses)
        const safeMessage = getSafeErrorMessage(err, 'File upload failed. Please try again.');
        console.error('Upload error (sanitized for log):', sanitizeMessage(err.message));
        return res.status(400).json({
            success: false,
            message: safeMessage
        });
    }
    next();
});

module.exports = router;
