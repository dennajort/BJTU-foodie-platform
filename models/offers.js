var Joi = require("joi"),
  Sequelize = require("sequelize"),
  STRING = Sequelize.STRING,
  INTEGER = Sequelize.INTEGER,
  TEXT = Sequelize.TEXT,
  FLOAT = Sequelize.FLOAT,
  DATE = Sequelize.DATE

module.exports = function(db, server) {
  db.define("offers", {
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
    description: {
      type: TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    restaurant: {
      type: INTEGER,
      allowNull: true
    },
    expiration_date: {
      type: DATE,
      allowNull: false
    },
    limit_coupon: {
      type: INTEGER,
      allowNull: true,
      validate: {
        min: 1
      }
    },
    remaining: {
      type: INTEGER,
      allowNull: true
    }
  }, {
    tableName: "offers",
    instanceMethods: {
      isOwner: function(oid) {
        return this.getRestaurant().then(function(resto) {
          return resto.isOwner(oid)
        })
      }
    },
    classMethods: {
      joiAttributes: function() {
        return {
          name: Joi.string().required(),
          description: Joi.string().required(),
          restaurant: Joi.number().integer().required(),
          expiration_date: Joi.date().required(),
          limit_coupon: Joi.number().integer().greater(0)
        }
      },
      toJoi: function() {
        return {
          id: Joi.number().integer(),
          name: Joi.string().required(),
          description: Joi.string(),
          restaurant: Joi.number().integer(),
          expiration_date: Joi.date(),
          limit_coupon: Joi.number().integer(),
          remaining: Joi.number().integer()
        }
      },
      queryJoi: function() {
        return {
          id: Joi.number().integer(),
          name: Joi.string(),
          restaurant: Joi.number().integer(),
          expiration_date: Joi.date(),
          limit_coupon: Joi.number().integer(),
          remaining: Joi.number().integer()
        }
      }
    }
  })
}
