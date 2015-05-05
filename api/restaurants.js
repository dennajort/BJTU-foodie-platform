var Joi = require("joi"),
  _ = require("lodash"),
  geo = require("geolib")

module.exports = function(server) {
  var Rest = server.plugins.rest,
    Restaurants = server.plugins.db.restaurants,
    Users = server.plugins.db.users

  server.route({
    method: "GET",
    path: "/restaurants/near",
    config: {
      description: "Find restaurants around a location",
      notes: "radius is in meters",
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
        Restaurants.findAll().then(function(restos) {
          rep(_(restos).map(function(r) {
            return {
              restaurant: r.toJSON(),
              distance: geo.getDistance(q, r)
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
      asOwner: true
    }),
    Rest.updateOne({
      path: "/me/restaurants/{id}",
      model: Restaurants,
      auth: "oauth",
      asOwner: true,
      payload: _.omit(Restaurants.joiAttributes(), "owner")
    })
  ])
}
