var Joi = require("joi"),
  _ = require("lodash")

module.exports = function(server) {
  var Rest = server.plugins.rest,
    Restaurants = server.plugins.db.restaurants,
    Offers = server.plugins.db.offers

  // Offers getters
  server.route([
    Rest.findAll({
      model: Offers,
      path: "/offers"
    }),
    Rest.findOne({
      model: Offers,
      path: "/offers/{id}"
    }),
    Rest.findRelated({
      model: Offers,
      parent: Restaurants,
      path: "/restaurants/{id}/offers",
      fk: "restaurant"
    })
  ])

  // Offers setters
  server.route([
    Rest.createRelated({
      path: "/me/restaurants/{id}/offers",
      model: Offers,
      parent: Restaurants,
      auth: "oauth",
      asOwner: true,
      fk: "restaurant",
      payload: _.omit(Offers.joiAttributes(), "restaurant"),
      preCreate: function(payload) {
        if (payload.limit_coupon !== undefined) {
          payload.remaining = payload.limit_coupon
        }
        return P.resolve(payload)
      }
    }),
    Rest.destroyOne({
      path: "/me/offers/{id}",
      model: Offers,
      auth: "oauth",
      asOwner: true
    })
  ])
}
