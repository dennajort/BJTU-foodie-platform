var P = require("bluebird"),
  bcrypt = require("bcrypt"),
  hashAsync = P.promisify(bcrypt.hash),
  compareAsync = P.promisify(bcrypt.compare),
  Joi = require("joi")

function hashPassword(passwd) {
  return hashAsync(passwd, 10)
}

module.exports = {
  identity: "users",
  connection: "db",

  attributes: {
    username: {
      type: "string",
      unique: true,
      required: true
    },
    email: {
      type: "email",
      index: true,
      unique: true,
      required: true
    },
    password: {
      type: "string",
      required: true
    },
    restaurants: {
      collection: "restaurants",
      via: "owner"
    },

    toJSON: function() {
      var obj = this.toObject()
      delete obj.password
      return obj
    }
  },

  setPassword: function(user, passwd) {
    return hashPassword(passwd).then(function(enc_passwd) {
      user.password = enc_passwd
      return user
    })
  },
  hashPassword: hashPassword,
  checkPassword: function(user, passwd) {
    return compareAsync(passwd, user.password)
  },
  toJoi: function() {
    return Joi.object().keys({
      username: Joi.string(),
      email: Joi.string()
    }).unknown(true)
  }
}
