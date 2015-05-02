var Joi = require("joi")

module.exports = function(server) {
  var Rest = server.plugins.rest,
    Users = server.plugins.db.users

  // User getters
  server.route([
    Rest.findAll({
      model: Users,
      path: "/users"
    }),
    Rest.findOne({
      model: Users,
      path: "/users/{id}"
    })
  ])

  // User setters
  server.route([
    {
      path: "/users",
      method: "POST",
      config: {
        description: "Add User",
        tags: ["users"],
        response: {
          schema: Users.toJoi()
        },
        validate: {
          payload: {
            firstname: Joi.string().required(),
            lastname: Joi.string().required(),
            email: Joi.string().email().required(),
            password: Joi.string().required()
          }
        },
        handler: function(req, rep) {
          var user = Users.build(req.payload)
          user.setPassword(req.payload.password).then(function() {
            return user.save().then(function(savedUser) {
              rep(savedUser)
            })
          }).catch(rep)
        }
      }
    }
  ])
}
