var P = require("bluebird"),
  bcrypt = require("bcrypt"),
  hashAsync = P.promisify(bcrypt.hash),
  compareAsync = P.promisify(bcrypt.compare),
  Joi = require("joi"),
  Sequelize = require("sequelize"),
  STRING = Sequelize.STRING,
  INTEGER = Sequelize.INTEGER

module.exports = function(db, server) {
  db.define("users", {
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
    }
  }, {
    tableName: "users",
    classMethods: {
      joiAttributes: function() {
        return {
          firstname: Joi.string().required(),
          lastname: Joi.string().required(),
          email: Joi.string().email().required(),
          password: Joi.string().required()
        }
      },
      toJoi: function() {
        return {
          id: Joi.number().integer(),
          firstname: Joi.string(),
          lastname: Joi.string(),
          email: Joi.string()
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
        var user = Sequelize.Instance.prototype.toJSON.call(this)
        delete user.password
        return user
      },
      checkPassword: function(passwd) {
        return compareAsync(passwd, this.password)
      }
    }
  })
}
