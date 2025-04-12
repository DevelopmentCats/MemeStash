const { Category, Meme } = require('../models');
const { Op } = require('sequelize');

/**
 * Create a new category
 * @route POST /api/categories
 */
const createCategory = async (req, res) => {
  try {
    const { name, description, color, icon } = req.body;
    const userId = req.user.id;
    
    // Check if category with same name already exists for this user
    const existingCategory = await Category.findOne({
      where: { name, userId }
    });
    
    if (existingCategory) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }
    
    // Create category
    const category = await Category.create({
      name,
      description,
      color,
      icon,
      userId
    });
    
    res.status(201).json({
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Error creating category' });
  }
};

/**
 * Get all categories for current user
 * @route GET /api/categories
 */
const getCategories = async (req, res) => {
  try {
    const userId = req.user.id;
    const { search } = req.query;
    
    // Build where clause
    const whereClause = { userId };
    
    // Add search condition if provided
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    // Get categories
    const categories = await Category.findAll({
      where: whereClause,
      order: [['name', 'ASC']]
    });
    
    res.status(200).json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Error retrieving categories' });
  }
};

/**
 * Get a single category by ID
 * @route GET /api/categories/:id
 */
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const category = await Category.findOne({
      where: { id, userId }
    });
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.status(200).json(category);
  } catch (error) {
    console.error('Get category by ID error:', error);
    res.status(500).json({ message: 'Error retrieving category' });
  }
};

/**
 * Update a category
 * @route PUT /api/categories/:id
 */
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { name, description, color, icon } = req.body;
    
    // Find category
    const category = await Category.findOne({
      where: { id, userId }
    });
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Check if new name conflicts with existing category
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({
        where: { name, userId, id: { [Op.ne]: id } }
      });
      
      if (existingCategory) {
        return res.status(400).json({ message: 'Category with this name already exists' });
      }
    }
    
    // Update fields
    category.name = name || category.name;
    category.description = description !== undefined ? description : category.description;
    category.color = color || category.color;
    category.icon = icon !== undefined ? icon : category.icon;
    
    await category.save();
    
    res.status(200).json({
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Error updating category' });
  }
};

/**
 * Delete a category
 * @route DELETE /api/categories/:id
 */
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Find category
    const category = await Category.findOne({
      where: { id, userId }
    });
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Delete category
    await category.destroy();
    
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Error deleting category' });
  }
};

/**
 * Get memes by category ID
 * @route GET /api/categories/:id/memes
 */
const getMemesByCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    
    const offset = (page - 1) * limit;
    
    // Check if category exists and belongs to user
    const category = await Category.findOne({
      where: { id, userId }
    });
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Get memes in this category
    const { count, rows: memes } = await Meme.findAndCountAll({
      include: [
        {
          model: Category,
          as: 'categories',
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
    console.error('Get memes by category error:', error);
    res.status(500).json({ message: 'Error retrieving memes by category' });
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getMemesByCategory
};