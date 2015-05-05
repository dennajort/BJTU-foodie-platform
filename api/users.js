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
          payload: Users.joiAttributes()
        },
        handler: function(req, rep) {
          Users.hashPassword(req.payload.password).then(function(enc_password) {
            req.payload.password = enc_password
            return Users.create(req.payload).then(function(user) {
              rep(user)
            })
          }).catch(rep)
        }
      }
    }
  ])
}
