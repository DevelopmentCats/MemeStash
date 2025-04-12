const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MemeCategory = sequelize.define('MemeCategory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  memeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'memes',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'categories',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'meme_categories',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['memeId', 'categoryId']
    }
  ]
});

module.exports = MemeCategory;