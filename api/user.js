var Joi = require("joi"),
  Boom = require("boom")

module.exports = function(server) {
  var rest = server.plugins.rest,
    db = server.plugins.db,
    User = db.models.User,
    Restaurant = db.models.Restaurant

  server.route([
    rest.create({
      path: "/users",
      model: User,
      payload: {
        username: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().required(),
      },
      postBuild: function(req, rep, user) {
        return user.setPassword(req.payload.password).then(function() {
          return user
        })
      }
    }), rest.find({
      path: "/users",
      model: User
    }), rest.findOne({
      path: "/users/{id}",
      model: User
    }), {
      path: "/users/{id}/restaurants",
      method: "GET",
      config: {
        description: "Get restaurants of one user",
        tags: ["User", "Restaurant"],
        response: {
          schema: Joi.array().items(db.schemas.Restaurant)
        },
        validate: {
          params: {
            id: Joi.string().required()
          }
        },
        handler: {
          generator: function*(req, rep) {
            var user = yield User.findOne({where: {id: req.params.id}, include: [Restaurant]})
            if (user === null) return rep(Boom.notFound())
            rep(user.Restaurants)
          }
        }
      }
    }
  ])
}
