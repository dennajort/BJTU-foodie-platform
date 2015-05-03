var Joi = require("joi"),
  _ = require("lodash")

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
