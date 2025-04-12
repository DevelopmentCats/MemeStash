const sequelize = require('../config/database');
const User = require('./user.model');
const Meme = require('./meme.model');
const Category = require('./category.model');
const Tag = require('./tag.model');
const MemeCategory = require('./meme-category.model');
const MemeTag = require('./meme-tag.model');
const ShareableLink = require('./shareable-link.model');

// Define associations
// User to Memes (one-to-many)
User.hasMany(Meme, { foreignKey: 'userId', as: 'memes' });
Meme.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User to Categories (one-to-many)
User.hasMany(Category, { foreignKey: 'userId', as: 'categories' });
Category.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User to Tags (one-to-many)
User.hasMany(Tag, { foreignKey: 'userId', as: 'tags' });
Tag.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Meme to Categories (many-to-many)
Meme.belongsToMany(Category, { through: MemeCategory, foreignKey: 'memeId', as: 'categories' });
Category.belongsToMany(Meme, { through: MemeCategory, foreignKey: 'categoryId', as: 'memes' });

// Meme to Tags (many-to-many)
Meme.belongsToMany(Tag, { through: MemeTag, foreignKey: 'memeId', as: 'tags' });
Tag.belongsToMany(Meme, { through: MemeTag, foreignKey: 'tagId', as: 'memes' });

// ShareableLink associations
User.hasMany(ShareableLink, { foreignKey: 'userId', as: 'shareableLinks' });
ShareableLink.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Meme.hasMany(ShareableLink, { foreignKey: 'memeId', as: 'shareableLinks' });
ShareableLink.belongsTo(Meme, { foreignKey: 'memeId', as: 'Meme' });

// Function to sync all models with the database
const syncModels = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log('Database synchronized successfully');
  } catch (error) {
    console.error('Error synchronizing database:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  User,
  Meme,
  Category,
  Tag,
  MemeCategory,
  MemeTag,
  ShareableLink,
  syncModels
};