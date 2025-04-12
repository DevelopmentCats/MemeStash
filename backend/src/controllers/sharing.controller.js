const { v4: uuidv4 } = require('uuid');
const { Meme, ShareableLink } = require('../models');
const path = require('path');
const fs = require('fs');

/**
 * Generate a shareable link for a meme
 * @route POST /api/memes/:id/share
 */
const generateShareableLink = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { isTemporary = false, expiresIn = 86400, isPublic = true } = req.body;
    
    // Find meme
    const meme = await Meme.findOne({
      where: { id, userId }
    });
    
    if (!meme) {
      return res.status(404).json({ message: 'Meme not found' });
    }
    
    // Generate unique token
    const token = uuidv4();
    
    // Calculate expiration date if temporary
    let expiresAt = null;
    if (isTemporary) {
      expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);
    }
    
    // Create shareable link in database
    const shareableLink = await ShareableLink.create({
      token,
      memeId: meme.id,
      userId,
      expiresAt,
      isPublic
    });
    
    // Generate full URL
    const baseUrl = process.env.BASE_URL || `http://${req.headers.host}`;
    const shareUrl = `${baseUrl}/share/${token}`;
    
    res.status(201).json({
      message: 'Shareable link generated successfully',
      shareUrl,
      token,
      expiresAt: shareableLink.expiresAt,
      isPublic: shareableLink.isPublic
    });
  } catch (error) {
    console.error('Generate shareable link error:', error);
    res.status(500).json({ message: 'Error generating shareable link' });
  }
};

/**
 * Get meme by shareable link token
 * @route GET /api/share/:token
 */
const getMemeByShareableLink = async (req, res) => {
  try {
    const { token } = req.params;
    
    // Find shareable link
    const shareableLink = await ShareableLink.findOne({
      where: { token },
      include: [{ model: Meme }]
    });
    
    if (!shareableLink) {
      return res.status(404).json({ message: 'Shareable link not found' });
    }
    
    // Check if link has expired
    if (shareableLink.expiresAt && new Date() > shareableLink.expiresAt) {
      return res.status(410).json({ message: 'Shareable link has expired' });
    }
    
    // Check if link is public or user is authenticated
    if (!shareableLink.isPublic && (!req.user || req.user.id !== shareableLink.userId)) {
      return res.status(403).json({ message: 'This link is private' });
    }
    
    // Return meme data
    res.status(200).json({
      meme: shareableLink.Meme,
      shareInfo: {
        createdAt: shareableLink.createdAt,
        expiresAt: shareableLink.expiresAt,
        isPublic: shareableLink.isPublic
      }
    });
  } catch (error) {
    console.error('Get meme by shareable link error:', error);
    res.status(500).json({ message: 'Error retrieving meme' });
  }
};

/**
 * Get meme file by shareable link token
 * @route GET /api/share/:token/file
 */
const getMemeFileByShareableLink = async (req, res) => {
  try {
    const { token } = req.params;
    
    // Find shareable link
    const shareableLink = await ShareableLink.findOne({
      where: { token },
      include: [{ model: Meme }]
    });
    
    if (!shareableLink) {
      return res.status(404).json({ message: 'Shareable link not found' });
    }
    
    // Check if link has expired
    if (shareableLink.expiresAt && new Date() > shareableLink.expiresAt) {
      return res.status(410).json({ message: 'Shareable link has expired' });
    }
    
    // Check if link is public or user is authenticated
    if (!shareableLink.isPublic && (!req.user || req.user.id !== shareableLink.userId)) {
      return res.status(403).json({ message: 'This link is private' });
    }
    
    const meme = shareableLink.Meme;
    
    // Check if file exists
    if (!fs.existsSync(meme.filePath)) {
      return res.status(404).json({ message: 'Meme file not found' });
    }
    
    // Send file
    res.sendFile(path.resolve(meme.filePath));
  } catch (error) {
    console.error('Get meme file by shareable link error:', error);
    res.status(500).json({ message: 'Error retrieving meme file' });
  }
};

/**
 * Delete a shareable link
 * @route DELETE /api/share/:token
 */
const deleteShareableLink = async (req, res) => {
  try {
    const { token } = req.params;
    const userId = req.user.id;
    
    // Find shareable link
    const shareableLink = await ShareableLink.findOne({
      where: { token, userId }
    });
    
    if (!shareableLink) {
      return res.status(404).json({ message: 'Shareable link not found' });
    }
    
    // Delete shareable link
    await shareableLink.destroy();
    
    res.status(200).json({ message: 'Shareable link deleted successfully' });
  } catch (error) {
    console.error('Delete shareable link error:', error);
    res.status(500).json({ message: 'Error deleting shareable link' });
  }
};

/**
 * Get all shareable links for a meme
 * @route GET /api/memes/:id/share
 */
const getShareableLinks = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Find meme
    const meme = await Meme.findOne({
      where: { id, userId }
    });
    
    if (!meme) {
      return res.status(404).json({ message: 'Meme not found' });
    }
    
    // Get all shareable links for this meme
    const shareableLinks = await ShareableLink.findAll({
      where: { memeId: meme.id, userId }
    });
    
    // Generate full URLs
    const baseUrl = process.env.BASE_URL || `http://${req.headers.host}`;
    const links = shareableLinks.map(link => ({
      id: link.id,
      token: link.token,
      shareUrl: `${baseUrl}/share/${link.token}`,
      createdAt: link.createdAt,
      expiresAt: link.expiresAt,
      isPublic: link.isPublic
    }));
    
    res.status(200).json(links);
  } catch (error) {
    console.error('Get shareable links error:', error);
    res.status(500).json({ message: 'Error retrieving shareable links' });
  }
};

/**
 * Generate metadata for social media sharing
 * @route GET /api/memes/:id/metadata
 */
const getMemeMetadata = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find meme - allow public access for metadata
    const meme = await Meme.findByPk(id);
    
    if (!meme) {
      return res.status(404).json({ message: 'Meme not found' });
    }
    
    // Generate metadata
    const baseUrl = process.env.BASE_URL || `http://${req.headers.host}`;
    const metadata = {
      title: meme.title,
      description: meme.description || 'A meme from Meme Stash',
      imageUrl: `${baseUrl}/api/memes/${meme.id}/file`,
      url: `${baseUrl}/meme/${meme.id}`
    };
    
    res.status(200).json(metadata);
  } catch (error) {
    console.error('Get meme metadata error:', error);
    res.status(500).json({ message: 'Error retrieving meme metadata' });
  }
};

module.exports = {
  generateShareableLink,
  getMemeByShareableLink,
  getMemeFileByShareableLink,
  deleteShareableLink,
  getShareableLinks,
  getMemeMetadata
};