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
