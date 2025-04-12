const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ShareableLink = sequelize.define('ShareableLink', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  token: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true
  },
  memeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'memes',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
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
  tableName: 'shareable_links',
  timestamps: true
});

module.exports = ShareableLink;