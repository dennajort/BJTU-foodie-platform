"use strict"
var Joi = require("joi"),
  P = require("bluebird"),
  Sequelize = require("sequelize"),
  STRING = Sequelize.STRING,
  INTEGER = Sequelize.INTEGER

module.exports = function(db) {
  db.define("gcm_keys", {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    owner: {
      type: INTEGER,
      allowNull: false
    },
    key: {
      type: STRING,
      unique: true,
      allowNull: false
    }
  }, {
    tableName: "gcm_keys",
    instanceMethods: {
      isOwner: P.method(function(oid) {
        return this.owner == oid
      })
    },
    classMethods: {
      joiAttributes: function() {
        return {
          key: Joi.string().required()
        }
      },
      toJoi: function() {
        return {}
      },
      queryJoi: function() {
        return {}
      }
    }
  })
}
