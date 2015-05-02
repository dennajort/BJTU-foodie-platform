var Joi = require("joi")

module.exports = function(server) {
  var Rest = server.plugins.rest,
    Restaurants = server.plugins.db.restaurants,
    Users = server.plugins.db.users

  // Restaurant getters
  server.route([
    Rest.findAll({
      model: Restaurants,
      path: "/restaurants"
    }),
    Rest.findOne({
      model: Restaurants,
      path: "/restaurants/{id}"
    }),
    Rest.findRelated({
      model: Restaurants,
      parent: Users,
      path: "/users/{id}/restaurants",
      fk: "owner"
    })
  ])

  // Restaurant setters
  server.route([
    Rest.create({
      path: "/me/restaurants",
      model: Restaurants,
      auth: "oauth",
      setOwner: true,
      ownerField: "owner",
      payload: {
        name: Joi.string().required(),
        short_description: Joi.string().required(),
        long_description: Joi.string().default(""),
        phone: Joi.string().required(),
        email: Joi.string().required(),
        address: Joi.string().required(),
        longitude: Joi.number().required(),
        latitude: Joi.number().required()
      }
    })
  ])
}
