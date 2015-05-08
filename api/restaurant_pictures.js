"use strict"
var Joi = require("joi"),
  Boom = require("boom")

module.exports = function(server) {
  var Rest = server.plugins.rest,
    Store = server.plugins.storage.store,
    Restaurants = server.plugins.db.restaurants,
    Pictures = server.plugins.db.restaurant_pictures

  // Pictures getters
  server.route([
    {
      method: "GET",
      path: "/restaurants/{id}/main_picture",
      config: {
        description: "Information about main picture",
        tags: [Restaurants.name, Pictures.name],
        response: {schema: Pictures.toJoi()},
        validate: {params: {id: Joi.number().integer().required()}},
        handler: function(req, rep) {
          Pictures.findOne({where: {
            restaurant: req.params.id,
            main: true
          }}).then(function(pic) {
            if (pic === null) throw Boom.notFound()
            rep(pic)
          }).catch(rep)
        }
      }
    },
    {
      method: "GET",
      path: "/restaurants/{id}/gallery",
      config: {
        description: "Information about gallery pictures",
        tags: [Restaurants.name, Pictures.name],
        response: {schema: Joi.array().items(Pictures.toJoi())},
        validate: {params: {id: Joi.number().integer().required()}},
        handler: function(req, rep) {
          Pictures.findAll({where: {
            restaurant: req.params.id,
            main: false
          }}).then(function(pic) {
            rep(pic)
          }).catch(rep)
        }
      }
    },
    Rest.findAll({
      model: Pictures,
      path: "/restaurant_pictures"
    }),
    Rest.findOne({
      model: Pictures,
      path: "/restaurant_pictures/{id}"
    })
  ])

  // Pictures setters
  server.route([
    {
      method: "POST",
      path: "/me/restaurants/{id}/main_picture",
      config: {
        description: "Set the main picture",
        tags: [Restaurants.name, Pictures.name, "me"],
        auth: "oauth",
        response: {schema: Pictures.toJoi()},
        payload: {output: "stream", parse: true},
        validate: {
          params: {id: Joi.number().integer().required()},
          payload: {
            file: Joi.object({
              pipe: Joi.func().required()
            }).required().meta({swaggerFile: true}).unknown()
          }
        },
        handler: function(req, rep) {
          Restaurants.findOne(req.params.id).then(function(resto) {
            if (resto === null) throw Boom.notFound()
            return resto.isOwner(req.auth.credentials.user.id).then(function(ok) {
              if (!ok) throw Boom.unauthorized()
              return resto.getPictures({where: {main: true}}).then(function(pics) {
                if (pics.length > 0) return pics[0].destroy()
              })
            }).then(function() {
              var idgen = server.plugins.idgen
              var filename = idgen.format(idgen.next(), 'hex')
              var ext = req.payload.file.hapi.filename.split(".").slice(1).join(".")
              filename = `${filename}.${ext}`
              return Store.upload("restaurants", filename, req.payload.file).then(function() {
                return resto.createPicture({
                  filename: filename,
                  main: true
                }).then(function(pic) {
                  rep(pic)
                })
              })
            })
          }).catch(rep)
        }
      }
    },
    {
      method: "POST",
      path: "/me/restaurants/{id}/gallery",
      config: {
        description: "Add a picture to the gallery",
        tags: [Restaurants.name, Pictures.name, "me"],
        auth: "oauth",
        response: {schema: Pictures.toJoi()},
        payload: {output: "stream", parse: true},
        validate: {
          params: {id: Joi.number().integer().required()},
          payload: {
            file: Joi.object({
              pipe: Joi.func().required()
            }).required().meta({swaggerFile: true}).unknown()
          }
        },
        handler: function(req, rep) {
          Restaurants.findOne(req.params.id).then(function(resto) {
            if (resto === null) throw Boom.notFound()
            return resto.isOwner(req.auth.credentials.user.id).then(function(ok) {
              if (!ok) throw Boom.unauthorized()
            }).then(function() {
              var idgen = server.plugins.idgen
              var filename = idgen.format(idgen.next(), 'hex')
              var ext = req.payload.file.hapi.filename.split(".").slice(1).join(".")
              filename = `${filename}.${ext}`
              return Store.upload("restaurants", filename, req.payload.file).then(function() {
                return resto.createPicture({
                  filename: filename,
                  main: false
                }).then(function(pic) {
                  rep(pic)
                })
              })
            })
          }).catch(rep)
        }
      }
    },
    Rest.destroyOne({
      path: "/me/restaurant_pictures/{id}",
      model: Pictures,
      auth: "oauth",
      asOwner: true
    })
  ])
}
