const { Tag, Meme } = require('../models');
const { Op } = require('sequelize');

/**
 * Create a new tag
 * @route POST /api/tags
 */
const createTag = async (req, res) => {
  try {
    const { name, color } = req.body;
    const userId = req.user.id;
    
    // Check if tag with same name already exists for this user
    const existingTag = await Tag.findOne({
      where: { name, userId }
    });
    
    if (existingTag) {
      return res.status(400).json({ message: 'Tag with this name already exists' });
    }
    
    // Create tag
    const tag = await Tag.create({
      name,
      color,
      userId
    });
    
    res.status(201).json({
      message: 'Tag created successfully',
      tag
    });
  } catch (error) {
    console.error('Create tag error:', error);
    res.status(500).json({ message: 'Error creating tag' });
  }
};

/**
 * Get all tags for current user
 * @route GET /api/tags
 */
const getTags = async (req, res) => {
  try {
    const userId = req.user.id;
    const { search } = req.query;
    
    // Build where clause
    const whereClause = { userId };
    
    // Add search condition if provided
    if (search) {
      whereClause.name = { [Op.iLike]: `%${search}%` };
    }
    
    // Get tags
    const tags = await Tag.findAll({
      where: whereClause,
      order: [['name', 'ASC']]
    });
    
    res.status(200).json(tags);
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ message: 'Error retrieving tags' });
  }
};

/**
 * Get a single tag by ID
 * @route GET /api/tags/:id
 */
const getTagById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const tag = await Tag.findOne({
      where: { id, userId }
    });
    
    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }
    
    res.status(200).json(tag);
  } catch (error) {
    console.error('Get tag by ID error:', error);
    res.status(500).json({ message: 'Error retrieving tag' });
  }
};

/**
 * Update a tag
 * @route PUT /api/tags/:id
 */
const updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { name, color } = req.body;
    
    // Find tag
    const tag = await Tag.findOne({
      where: { id, userId }
    });
    
    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }
    
    // Check if new name conflicts with existing tag
    if (name && name !== tag.name) {
      const existingTag = await Tag.findOne({
        where: { name, userId, id: { [Op.ne]: id } }
      });
      
      if (existingTag) {
        return res.status(400).json({ message: 'Tag with this name already exists' });
      }
    }
    
    // Update fields
    tag.name = name || tag.name;
    tag.color = color || tag.color;
    
    await tag.save();
    
    res.status(200).json({
      message: 'Tag updated successfully',
      tag
    });
  } catch (error) {
    console.error('Update tag error:', error);
    res.status(500).json({ message: 'Error updating tag' });
  }
};

/**
 * Delete a tag
 * @route DELETE /api/tags/:id
 */
const deleteTag = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Find tag
    const tag = await Tag.findOne({
      where: { id, userId }
    });
    
    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }
    
    // Delete tag
    await tag.destroy();
    
    res.status(200).json({ message: 'Tag deleted successfully' });
  } catch (error) {
    console.error('Delete tag error:', error);
    res.status(500).json({ message: 'Error deleting tag' });
  }
};

/**
 * Get memes by tag ID
 * @route GET /api/tags/:id/memes
 */
const getMemesByTag = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    
    const offset = (page - 1) * limit;
    
    // Check if tag exists and belongs to user
    const tag = await Tag.findOne({
      where: { id, userId }
    });
    
    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }
    
    // Get memes with this tag
    const { count, rows: memes } = await Meme.findAndCountAll({
      include: [
        {
          model: Tag,
          as: 'tags',
          where: { id },
          through: { attributes: [] }
        }
      ],
      where: { userId },
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      distinct: true
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
    console.error('Get memes by tag error:', error);
    res.status(500).json({ message: 'Error retrieving memes by tag' });
  }
};

module.exports = {
  createTag,
  getTags,
  getTagById,
  updateTag,
  deleteTag,
  getMemesByTag
};