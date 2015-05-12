"use strict"
module.exports = function(server) {
  var Rest = server.plugins.rest,
    Users = server.plugins.db.users,
    Store = server.plugins.storage.store

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

  // Users setters
  server.route([
    {
      path: "/users",
      method: "POST",
      config: {
        description: "Create a user",
        tags: [Users.name],
        response: {schema: Users.toJoi()},
        validate: {payload: Users.joiAttributes()},
        payload: {output: "stream", parse: true, maxBytes: 10485760},
        handler: function(req, rep) {
          Users.hashPassword(req.payload.password).then(function(enc_password) {
            req.payload.password = enc_password
            var picture = req.payload.picture
            var rand = server.plugins.idgen.rand
            var ext = picture.hapi.filename.split(".").slice(1).join(".")
            var filename = `${rand()}.${ext}`
            req.payload.picture = filename
            return Store.upload("users", filename, picture).then(function() {
              return Users.create(req.payload).then(function(user) {
                rep(user)
              }).catch(function(err) {
                return Store.removeFile("users", filename).then(function() {
                  throw err
                })
              })
            })
          }).catch(rep)
        }
      }
    }
  ])
}
