"use strict"
var Joi = require("joi"),
  Sequelize = require("sequelize"),
  STRING = Sequelize.STRING,
  INTEGER = Sequelize.INTEGER,
  BOOLEAN = Sequelize.BOOLEAN

module.exports = function(db, server) {
  var Pictures = db.define("restaurant_pictures", {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    restaurant: {
      type: INTEGER,
      allowNull: false
    },
    main: {
      type: BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    filename: {
      type: STRING,
      allowNull: false,
      unique: true
    }
  }, {
    tableName: "restaurant_pictures",
    instanceMethods: {
      isOwner: function(oid) {
        return this.getRestaurant().then(function(resto) {
          return resto.isOwner(oid)
        })
      },
      toJSON: function() {
        var store = server.plugins.storage.store
        var pic = Sequelize.Instance.prototype.toJSON.call(this)
        pic.url = store.makeUrl("restaurants", this.filename)
        return pic
      }
    },
    classMethods: {
      joiAttributes: function() {
        return {
          restaurant: Joi.number().integer().required(),
          main: Joi.boolean()
        }
      },
      toJoi: function() {
        return {
          id: Joi.number().integer(),
          restaurant: Joi.number().integer(),
          url: Joi.string(),
          filename: Joi.string(),
          main: Joi.boolean()
        }
      },
      queryJoi: function() {
        return {
          id: Joi.number().integer(),
          restaurant: Joi.number().integer(),
          filename: Joi.string(),
          main: Joi.boolean()
        }
      }
    }
  })

  server.dependency("storage", function(server, done) {
    var Store = server.plugins.storage.store

    Store.createContainer("restaurants").then(function() {
      done()
    }).catch(done)

    Pictures.hook("afterDestroy", function(pic) {
      return Store.removeFile("restaurants", pic.filename)
    })
  })
}
