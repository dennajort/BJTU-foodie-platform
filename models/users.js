var P = require("bluebird"),
  bcrypt = require("bcrypt"),
  hashAsync = P.promisify(bcrypt.hash),
  compareAsync = P.promisify(bcrypt.compare),
  Joi = require("joi"),
  Sequelize = require("sequelize"),
  STRING = Sequelize.STRING,
  INTEGER = Sequelize.INTEGER

function hashPassword(passwd) {
  return hashAsync(passwd, 10)
}

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
      }
    },
    instanceMethods: {
      toJSON: function() {
        var user = Sequelize.Instance.prototype.toJSON.call(this)
        delete user.password
        return user
      },
      setPassword: function(passwd) {
        return hashAsync(passwd, 10).bind(this).then(function(enc_passwd) {
          this.password = enc_passwd
        })
      },
      checkPassword: function(passwd) {
        return compareAsync(passwd, this.password)
      }
    }
  })
}
