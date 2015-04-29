var Joi = require("joi")

module.exports = function(server) {
  return {
    identity: "restaurant_pictures",
    connection: "db",

    attributes: {
      filename: {
        type: "string",
        required: true
      },
      uri: function() {
        return server.plugins.storage.toUri("restaurant_pictures", this.filename)
      },
      restaurant: {
        model: "restaurants"
      },

      toJSON: function() {
        var obj = this.toObject()
        delete obj.filename
        return obj
      }
    },

    toJoi: function() {
      return Joi.object().keys({
        uri: Joi.string()
      }).unknown(true)
    }
  }
}
