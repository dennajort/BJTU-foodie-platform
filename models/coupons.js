"use strict"
var Joi = require("joi"),
  FlakeID = require("flake-idgen"),
  fid = new FlakeID(),
  intformat = require('biguint-format'),
  P = require("bluebird"),
  Sequelize = require("sequelize"),
  STRING = Sequelize.STRING,
  INTEGER = Sequelize.INTEGER,
  BOOLEAN = Sequelize.BOOLEAN

module.exports = function(db, server) {
  db.define("coupons", {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    offer: {
      type: INTEGER,
      allowNull: true
    },
    owner: {
      type: INTEGER,
      allowNull: true
    },
    secret: {
      type: STRING,
      unique: true,
      allowNull: false,
      defaultValue: function() {
        return intformat(fid.next(), 'hex', { prefix: '0x' })
      }
    },
    used: {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    tableName: "coupons",
    instanceMethods: {
      isOwner: function(oid) {
        return P.resolve(this.owner == oid)
      }
    },
    classMethods: {
      joiAttributes: function() {
        return {}
      },
      toJoi: function() {
        return {
          id: Joi.number().integer(),
          offer: Joi.number().integer(),
          owner: Joi.number().integer(),
          secret: Joi.string(),
          used: Joi.boolean()
        }
      },
      queryJoi: function() {
        return {
          id: Joi.number().integer(),
          offer: Joi.number().integer(),
          owner: Joi.number().integer(),
          secret: Joi.string(),
          used: Joi.boolean()
        }
      }
    }
  })
}
