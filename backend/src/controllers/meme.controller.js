const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');
const { Meme, Category, Tag, MemeCategory, MemeTag } = require('../models');

/**
 * Upload a new meme
 * @route POST /api/memes
 */
const uploadMeme = async (req, res) => {
  try {
    // File is already uploaded by multer middleware
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { title, description, categoryIds, tags } = req.body;
    const userId = req.user.id;
    
    // Create meme record
    const meme = await Meme.create({
      title,
      description,
      filePath: req.file.path,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      originalFilename: req.file.originalname,
      userId
    });

    // Process categories if provided
    if (categoryIds && categoryIds.length > 0) {
      // Convert to array if it's a string
      const categoryIdsArray = Array.isArray(categoryIds) 
        ? categoryIds 
        : categoryIds.split(',').map(id => parseInt(id.trim(), 10));
      
      // Verify categories exist and belong to user
      const categories = await Category.findAll({
        where: {
          id: { [Op.in]: categoryIdsArray },
          userId
        }
      });
      
      // Associate meme with categories
      if (categories.length > 0) {
        await meme.setCategories(categories);
      }
    }

    // Process tags if provided
    if (tags && tags.length > 0) {
      // Convert to array if it's a string
      const tagNames = Array.isArray(tags) 
        ? tags 
        : tags.split(',').map(tag => tag.trim());
      
      // For each tag, find or create
      const tagPromises = tagNames.map(async (name) => {
        const [tag] = await Tag.findOrCreate({
          where: { name, userId }
        });
        return tag;
      });
      
      const createdTags = await Promise.all(tagPromises);
      
      // Associate meme with tags
      if (createdTags.length > 0) {
        await meme.setTags(createdTags);
      }
    }

    // Fetch the meme with its associations
    const memeWithAssociations = await Meme.findByPk(meme.id, {
      include: [
        { model: Category, as: 'categories' },
        { model: Tag, as: 'tags' }
      ]
    });

    res.status(201).json({
      message: 'Meme uploaded successfully',
      meme: memeWithAssociations
    });
  } catch (error) {
    console.error('Meme upload error:', error);
    // If there was an error and a file was uploaded, delete it
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    res.status(500).json({ message: 'Error uploading meme' });
  }
};

/**
 * Get all memes with pagination and filtering
 * @route GET /api/memes
 */
const getMemes = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      categoryId, 
      tagId,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    // Build where clause
    const whereClause = { userId };
    
    // Add search condition if provided
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    // Build include array for associations
    const include = [];
    
    // Include categories and filter by categoryId if provided
    if (categoryId) {
      include.push({
        model: Category,
        as: 'categories',
        where: { id: categoryId },
        through: { attributes: [] } // Don't include junction table
      });
    } else {
      include.push({
        model: Category,
        as: 'categories',
        through: { attributes: [] }
      });
    }
    
    // Include tags and filter by tagId if provided
    if (tagId) {
      include.push({
        model: Tag,
        as: 'tags',
        where: { id: tagId },
        through: { attributes: [] }
      });
    } else {
      include.push({
        model: Tag,
        as: 'tags',
        through: { attributes: [] }
      });
    }
    
    // Validate sort parameters
    const validSortFields = ['title', 'createdAt', 'fileSize'];
    const validSortOrders = ['ASC', 'DESC'];
    
    const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const finalSortOrder = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';
    
    // Get memes with pagination
    const { count, rows: memes } = await Meme.findAndCountAll({
      where: whereClause,
      include,
      order: [[finalSortBy, finalSortOrder]],
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      distinct: true // Important for correct count with associations
    });
    
    // Calculate pagination info
    const totalPages = Math.ceil(count / limit);
    
    res.status(200).json({
      memes,
      pagination: {
        total: count,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages
      }
    });
  } catch (error) {
    console.error('Get memes error:', error);
    res.status(500).json({ message: 'Error retrieving memes' });
  }
};

/**
 * Get a single meme by ID
 * @route GET /api/memes/:id
 */
const getMemeById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const meme = await Meme.findOne({
      where: { id, userId },
      include: [
        { model: Category, as: 'categories', through: { attributes: [] } },
        { model: Tag, as: 'tags', through: { attributes: [] } }
      ]
    });
    
    if (!meme) {
      return res.status(404).json({ message: 'Meme not found' });
    }
    
    res.status(200).json(meme);
  } catch (error) {
    console.error('Get meme by ID error:', error);
    res.status(500).json({ message: 'Error retrieving meme' });
  }
};

/**
 * Update a meme
 * @route PUT /api/memes/:id
 */
const updateMeme = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, description, categoryIds, tags } = req.body;
    
    // Find meme
    const meme = await Meme.findOne({
      where: { id, userId }
    });
    
    if (!meme) {
      return res.status(404).json({ message: 'Meme not found' });
    }
    
    // Update basic fields
    meme.title = title || meme.title;
    meme.description = description !== undefined ? description : meme.description;
    
    await meme.save();
    
    // Update categories if provided
    if (categoryIds) {
      // Convert to array if it's a string
      const categoryIdsArray = Array.isArray(categoryIds) 
        ? categoryIds 
        : categoryIds.split(',').map(id => parseInt(id.trim(), 10));
      
      // Verify categories exist and belong to user
      const categories = await Category.findAll({
        where: {
          id: { [Op.in]: categoryIdsArray },
          userId
        }
      });
      
      // Replace existing categories
      await meme.setCategories(categories);
    }
    
    // Update tags if provided
    if (tags) {
      // Convert to array if it's a string
      const tagNames = Array.isArray(tags) 
        ? tags 
        : tags.split(',').map(tag => tag.trim());
      
      // For each tag, find or create
      const tagPromises = tagNames.map(async (name) => {
        const [tag] = await Tag.findOrCreate({
          where: { name, userId }
        });
        return tag;
      });
      
      const updatedTags = await Promise.all(tagPromises);
      
      // Replace existing tags
      await meme.setTags(updatedTags);
    }
    
    // Fetch updated meme with associations
    const updatedMeme = await Meme.findByPk(meme.id, {
      include: [
        { model: Category, as: 'categories', through: { attributes: [] } },
        { model: Tag, as: 'tags', through: { attributes: [] } }
      ]
    });
    
    res.status(200).json({
      message: 'Meme updated successfully',
      meme: updatedMeme
    });
  } catch (error) {
    console.error('Update meme error:', error);
    res.status(500).json({ message: 'Error updating meme' });
  }
};

/**
 * Delete a meme
 * @route DELETE /api/memes/:id
 */
const deleteMeme = async (req, res) => {
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
    
    // Get file path before deleting record
    const filePath = meme.filePath;
    
    // Delete meme from database
    await meme.destroy();
    
    // Delete file from storage
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    res.status(200).json({ message: 'Meme deleted successfully' });
  } catch (error) {
    console.error('Delete meme error:', error);
    res.status(500).json({ message: 'Error deleting meme' });
  }
};

/**
 * Serve meme file
 * @route GET /api/memes/:id/file
 */
const getMemeFile = async (req, res) => {
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
    
    // Check if file exists
    if (!fs.existsSync(meme.filePath)) {
      return res.status(404).json({ message: 'Meme file not found' });
    }
    
    // Send file
    res.sendFile(path.resolve(meme.filePath));
  } catch (error) {
    console.error('Get meme file error:', error);
    res.status(500).json({ message: 'Error retrieving meme file' });
  }
};

module.exports = {
  uploadMeme,
  getMemes,
  getMemeById,
  updateMeme,
  deleteMeme,
  getMemeFile
};