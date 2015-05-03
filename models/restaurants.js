var Joi = require("joi"),
  Sequelize = require("sequelize"),
  STRING = Sequelize.STRING,
  INTEGER = Sequelize.INTEGER,
  TEXT = Sequelize.TEXT,
  FLOAT = Sequelize.FLOAT

module.exports = function(db, server) {
  db.define("restaurants", {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    short_description: {
      type: TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    long_description: {
      type: TEXT,
      allowNull: false,
      defaultValue: ""
    },
    email: {
      type: STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        isEmail: true
      }
    },
    phone: {
      type: STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    address: {
      type: STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    longitude: {
      type: FLOAT,
      allowNull: false
    },
    latitude: {
      type: FLOAT,
      allowNull: false
    },
    owner: {
      type: INTEGER,
      allowNull: true
    }
  }, {
    tableName: "restaurants",
    classMethods: {
      joiAttributes: function() {
        return {
          name: Joi.string().required(),
          short_description: Joi.string().required(),
          long_description: Joi.string().default(""),
          email: Joi.string().email().required(),
          phone: Joi.string().required(),
          address: Joi.string().required(),
          longitude: Joi.number().required(),
          latitude: Joi.number().required(),
          owner: Joi.number().integer().required()
        }
      },
      toJoi: function() {
        return {
          id: Joi.number().integer(),
          name: Joi.string(),
          short_description: Joi.string(),
          long_description: Joi.string(),
          email: Joi.string(),
          phone: Joi.string(),
          address: Joi.string(),
          longitude: Joi.number(),
          latitude: Joi.number(),
          owner: Joi.number().integer()
        }
      },
      queryJoi: function() {
        return {
          id: Joi.number().integer(),
          name: Joi.string(),
          owner: Joi.number().integer()
        }
      }
    }
  })
}
