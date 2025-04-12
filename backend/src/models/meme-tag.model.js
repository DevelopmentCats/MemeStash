const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MemeTag = sequelize.define('MemeTag', {
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
  tagId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'tags',
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
  tableName: 'meme_tags',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['memeId', 'tagId']
    }
  ]
});

module.exports = MemeTag;