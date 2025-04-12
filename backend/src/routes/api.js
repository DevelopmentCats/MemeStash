const express = require('express');
const router = express.Router();

// Import controllers
const memesController = require('../controllers/meme.controller');
const sharingController = require('../controllers/sharing.controller');

// Meme routes
router.get('/memes', memesController.getMemes);
router.get('/memes/:id', memesController.getMemeById);
router.post('/memes', memesController.uploadMeme);
router.put('/memes/:id', memesController.updateMeme);
router.delete('/memes/:id', memesController.deleteMeme);
router.get('/memes/:id/file', memesController.getMemeFile);

// Sharing routes
router.post('/memes/:id/share', sharingController.generateShareableLink);
router.get('/memes/:id/share', sharingController.getShareableLinks);
router.get('/memes/:id/metadata', sharingController.getMemeMetadata);
router.get('/share/:token', sharingController.getMemeByShareableLink);
router.get('/share/:token/file', sharingController.getMemeFileByShareableLink);
router.delete('/share/:token', sharingController.deleteShareableLink);

// More routes will be added as the application grows

module.exports = router;