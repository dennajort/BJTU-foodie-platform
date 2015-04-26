var Joi = require("joi")

module.exports = function(server) {
  var Users = server.plugins.dogwater.users

  // User getters
  server.route([
    {
      path: "/users",
      method: "GET",
      config: {
        description: "Get Users",
        tags: ["Users"],
        response: {schema: Joi.array().items(Users.toJoi())},
        handler: {bedwetter: {}}
      }
    },
    {
      path: "/users/{id}",
      method: "GET",
      config: {
        description: "Get one User",
        tags: ["Users"],
        response: {schema: Users.toJoi()},
        validate: {
          params: {id: Joi.string().required()}
        },
        handler: {bedwetter: {}}
      }
    }
  ])

  // User setters
  server.route([
    {
      path: "/users",
      method: "POST",
      config: {
        description: "Add User",
        tags: ["Users"],
        response: {
          schema: Users.toJoi()
        },
        validate: {
          payload: {
            username: Joi.string().required(),
            email: Joi.string().email().required(),
            password: Joi.string().required()
          }
        },
        handler: function(req, rep) {
          Users.setPassword(req.payload, req.payload.password).then(function(payload) {
            return Users.create(payload).then(function(savedUser) {
              rep(savedUser)
            })
          }).catch(rep)
        }
      }
    }
  ])
}
