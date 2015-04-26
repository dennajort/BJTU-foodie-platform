var Joi = require("joi")

module.exports = {
  identity: "restaurants",
  connection: "db",

  attributes: {
    name: {
      type: "string",
      required: true
    },
    description: {
      type: "text"
    },
    address: {
      type: "string",
      required: true
    },
    longitude: {
      type: "float",
      required: true
    },
    latitude: {
      type: "float",
      required: true
    },
    owner: {
      model: "users"
    }
  },

  setPassword: function(user, passwd) {
    return hashAsync(passwd, 10).then(function(enc_passwd) {
      user.password = enc_passwd
      return user
    })
  },
  checkPassword: function(user, passwd) {
    return compareAsync(passwd, user.password)
  },
  toJoi: function() {
    return Joi.object().keys({
      name: Joi.string(),
      description: Joi.string(),
      address: Joi.string(),
      longitude: Joi.number(),
      latitude: Joi.number()
    }).unknown(true)
  }
}
