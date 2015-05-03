var Joi = require("joi"),
  _ = require("lodash")

module.exports = function(server) {
  var Rest = server.plugins.rest,
    Restaurants = server.plugins.db.restaurants,
    Users = server.plugins.db.users

  server.route({
    method: "GET",
    path: "/restaurants/near",
    config: {
      description: "Find restaurants around a location",
      tags: [Restaurants.name],
      response: {
        schema: Joi.array().items(Joi.object().keys({
          distance: Joi.number(),
          restaurant: Restaurants.toJoi()
        }))
      },
      validate: {
        query: {
          longitude: Joi.number().required(),
          latitude: Joi.number().required(),
          radius: Joi.number().positive().required()
        }
      },
      handler: function(req, rep) {
        var q = req.query
        Restaurants.findAll({where: {
          longitude: {lte: q.longitude + q.radius, gte: q.longitude - q.radius},
          latitude: {lte: q.latitude + q.radius, gte: q.latitude - q.radius}
        }}).then(function(restos) {
          rep(_(restos).map(function(r) {
            return {
              restaurant: r.toJSON(),
              distance: Math.sqrt(Math.pow(r.latitude - q.latitude) + Math.pow(r.longitude - q.longitude))
            }
          }).filter(function(v) {
            return v.distance >= q.radius
          }).sortBy("distance").value())
        }).catch(rep)
      }
    }
  })

  // Restaurant getters
  server.route([
    Rest.findAll({
      model: Restaurants,
      path: "/restaurants"
    }),
    Rest.findAll({
      model: Restaurants,
      path: "/me/restaurants",
      auth: "oauth",
      asOwner: true,
      ownerField: "owner"
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
      payload: _.omit(Restaurants.joiAttributes(), "owner")
    }),
    Rest.destroyOne({
      path: "/me/restaurants/{id}",
      model: Restaurants,
      auth: "oauth",
      asOwner: true,
      ownerField: "owner"
    }),
    Rest.updateOne({
      path: "/me/restaurants/{id}",
      model: Restaurants,
      auth: "oauth",
      asOwner: true,
      ownerField: "owner",
      payload: _.omit(Restaurants.joiAttributes(), "owner")
    })
  ])
}
