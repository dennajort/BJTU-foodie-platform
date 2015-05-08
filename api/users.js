"use strict"
module.exports = function(server) {
  var Rest = server.plugins.rest,
    Users = server.plugins.db.users

  server.route({
    path: "/me",
    method: "GET",
    config: {
      auth: "oauth",
      description: "Get current authenticated user",
      tags: ["me"],
      response: {schema: Users.toJoi()},
      handler: function(req, rep) {
        rep(req.auth.credentials.user)
      }
    }
  })

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
    Rest.create({
      model: Users,
      path: "/users",
      payload: Users.joiAttributes(),
      preCreate: function(payload) {
        return Users.hashPassword(payload.password).then(function(enc_password) {
          payload.password = enc_password
          return payload
        })
      }
    })
  ])
}
