"use strict"
var Joi = require("joi"),
  Boom = require("boom")

module.exports = function(server) {
  var Rest = server.plugins.rest,
    DB = server.plugins.db,
    Coupons = DB.coupons,
    Offers = DB.offers,
    Restaurants = DB.restaurants

  // Coupons getters
  server.route([
    Rest.findAll({
      model: Coupons,
      path: "/me/coupons",
      auth: "oauth",
      asOwner: true,
      ownerField: "owner"
    })
  ])

  // Coupons setters
  server.route({
    method: "POST",
    path: "/me/offers/{id}/coupons",
    config: {
      description: "Create a coupon from an offer",
      tags: [Offers.name, Coupons.name, "me"],
      auth: "oauth",
      response: {schema: Coupons.toJoi()},
      validate: {params: {id: Joi.number().integer().required()}},
      handler: function(req, rep) {
        Offers.findById(req.params.id).then(function(offer) {
          if (offer === null) throw Boom.notFound()
          if (offer.isExpired() || (offer.limit_coupon && offer.remaining <= 0)) throw Boom.badRequest()
          if (offer.limit_coupon) return offer.decrement("remaining").then(function(new_offer) {
            return new_offer
          })
          return offer
        }).then(function(offer) {
          return offer.createCoupon({owner: req.auth.credentials.user.id}).then(function(coupon) {
            rep(coupon)
          })
        }).catch(rep)
      }
    }
  })

  // Coupons check and use
  function getInfoCoupon(secret, oid) {
    return Coupons.findOne({where: {secret: secret}}).then(function(coupon) {
      if (coupon === null) return {valid: false}
      return coupon.getOffer().then(function(offer) {
        if (offer === null) return {valid: false}
        return offer.isOwner(oid).then(function(ok) {
          if (!ok) return {valid: false}
          if (coupon.used || offer.isExpired()) return {valid: false, offer: offer, coupon: coupon}
          return {valid: true, offer: offer, coupon: coupon}
        })
      })
    })
  }

  server.route([
    {
      method: "GET",
      path: "/me/coupons/check",
      config: {
        description: "Get infos about a coupon before validating it",
        auth: "oauth",
        tags: [Coupons.name, "me"],
        response: {
          schema: {
            valid: Joi.boolean(),
            offer: Offers.toJoi(),
            restaurant: Restaurants.toJoi()
          }
        },
        validate: {query: {secret: Joi.string().required()}},
        handler: function(req, rep) {
          getInfoCoupon(req.query.secret, req.auth.credentials.user.id).then(function(infos) {
            if (infos.valid === false) return rep({valid: false, offer: infos.offer})
            return infos.offer.getRestaurant().then(function(resto) {
              if (resto === null) return rep({valid: false})
              rep({valid: infos.valid, offer: infos.offer, restaurant: resto})
            })
          }).catch(rep)
        }
      }
    }, {
      method: "PUT",
      path: "/me/coupons/use",
      config: {
        description: "Use a coupon",
        auth: "oauth",
        tags: [Coupons.name, "me"],
        response: {schema: {ok: Joi.boolean()}},
        validate: {payload: {secret: Joi.string().required()}},
        handler: function(req, rep) {
          getInfoCoupon(req.payload.secret, req.auth.credentials.user.id).then(function(infos) {
            if (!infos.valid) return rep({ok: false})
            return rep({ok: true})
            return infos.coupon.update({used: true}).then(function() {
              rep({ok: true})
            })
          }).catch(rep)
        }
      }
    }
  ])
}
