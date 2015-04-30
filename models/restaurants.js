var Joi = require("joi")

module.exports = function(server) {
  return {
    identity: "restaurants",
    connection: "db",
    migrate: "alter",

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
      },
      pictures: {
        collection: "restaurant_pictures",
        via: "restaurant"
      }
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
}
