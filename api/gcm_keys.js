"use strict"
var Joi = require("joi")

module.exports = function(server) {
  var GCMKeys = server.plugins.db.gcm_keys

  // GCM keys setters
  server.route([
    {
      method: "POST",
      path: "/me/gcm_keys",
      config: {
        description: "Add or update a GCM key",
        tags: [GCMKeys.name, "me"],
        auth: "oauth",
        validate: {payload: GCMKeys.joiAttributes()},
        response: {status: {"204": Joi}},
        handler: function(req, rep) {
          GCMKeys.findOne({where: {key: req.payload.key}}).then(function(key) {
            if (key === null) key = GCMKeys.build({key: req.payload.key})
            key.owner = req.auth.credentials.user.id
            return key.save().then(function() {
              rep().code(204).type('application/json')
            })
          }).catch(rep)
        }
      }
    },
    {
      method: "DELETE",
      path: "/me/gcm_keys/{key}",
      config: {
        description: "Delete GCM key",
        tags: [GCMKeys.name, "me"],
        auth: "oauth",
        validate: {params: GCMKeys.joiAttributes()},
        response: {status: {"204": Joi}},
        handler: function(req, rep) {
          GCMKeys.findOne({where: {key: req.params.key}}).then(function(key) {
            if (key === null) return rep().code(204).type('application/json')
            return key.isOwner(req.auth.credentials.user.id).then(function(ok) {
              if (!ok) return rep().code(204).type('application/json')
              return key.destroy().then(function() {
                rep().code(204).type('application/json')
              })
            })
          }).catch(rep)
        }
      }
    }
  ])
}
