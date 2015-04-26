var Joi = require("joi"),
  Boom = require("boom")

module.exports = function(server) {
  var rest = server.plugins.rest,
    db = server.plugins.db,
    Restaurant = db.models.Restaurant

  server.route([
    rest.create({
      path: "/restaurants",
      model: Restaurant,
      payload: {
        name: Joi.string().required(),
        text: Joi.string().default(""),
        address: Joi.string().default(""),
        latitude: Joi.number().required(),
        longitude: Joi.number().required()
      },
      auth: "oauth",
      preBuild: function(req, rep) {
        req.payload.UserId = req.auth.credentials.user.id
      }
    }), rest.find({
      path: "/restaurants",
      model: Restaurant
    }), rest.findOne({
      path: "/restaurants/{id}",
      model: Restaurant
    }), {
      path: "/restaurants/{id}/pictures",
      method: "GET",
      config: {
        description: "Get restaurant pictures",
        tags: ["Restaurant"],
        validate: {
          params: {
            id: Joi.string().required()
          }
        },
        response: {
          schema: Joi.array().items(db.schemas.RestaurantPicture)
        },
        handler: {
          generator: function*(req, rep) {
            var resto = yield Restaurant.findOne({where: {id: req.params.id}, include: [RestaurantPicture]})
            if (resto === null) return rep(Boom.notFound())
            rep(resto.RestaurantPictures)
          }
        }
      }
    }
  ])
}
