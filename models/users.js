"use strict"
var P = require("bluebird"),
  bcrypt = require("bcrypt"),
  Joi = require("joi"),
  Sequelize = require("sequelize"),
  STRING = Sequelize.STRING,
  INTEGER = Sequelize.INTEGER

var hashAsync = P.promisify(bcrypt.hash),
  compareAsync = P.promisify(bcrypt.compare)

const CONTAINER_NAME = "users"

module.exports = function(db, server) {
  var Users = db.define("users", {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    firstname: {
      type: STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    lastname: {
      type: STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    email: {
      type: STRING,
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: true,
        isEmail: true
      }
    },
    password: {
      type: STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    picture: {
      type: STRING,
      allowNull: true,
      defaultValue: null
    }
  }, {
    tableName: "users",
    classMethods: {
      joiAttributes: function() {
        return {
          firstname: Joi.string().required(),
          lastname: Joi.string().required(),
          email: Joi.string().email().required(),
          password: Joi.string().required(),
          picture: Joi.object({
            pipe: Joi.func().required()
          }).meta({swaggerFile: true}).unknown()
        }
      },
      toJoi: function() {
        return {
          id: Joi.number().integer(),
          firstname: Joi.string(),
          lastname: Joi.string(),
          email: Joi.string(),
          picture: Joi.string()
        }
      },
      queryJoi: function() {
        return {
          id: Joi.number().integer(),
          firstname: Joi.string(),
          lastname: Joi.string()
        }
      },
      hashPassword: function(passwd) {
        return hashAsync(passwd, 10)
      }
    },
    instanceMethods: {
      toJSON: function() {
        var Store = server.plugins.storage.store
        var user = Sequelize.Instance.prototype.toJSON.call(this)
        delete user.password
        if (user.picture !== null) user.picture = Store.makeUrl(CONTAINER_NAME, user.picture)
        return user
      },
      checkPassword: function(passwd) {
        return compareAsync(passwd, this.password)
      }
    }
  })

  server.dependency("storage", function(server, done) {
    var Store = server.plugins.storage.store

    Users.hook("afterDestroy", function(user) {
      if (user.picture === null) return P.resolve()
      return Store.removeFile(CONTAINER_NAME, user.picture)
    })

    Store.createContainer(CONTAINER_NAME).then(function() {
      done()
    }).catch(done)
  })
}
