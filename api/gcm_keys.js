"use strict"
var Joi = require("joi"),
  _ = require("lodash")

module.exports = function(server) {
  var GCMKeys = server.plugins.db.gcm_keys

  // Test GCM keys
  server.route({
    method: "GET",
    path: "/me/gcm_keys_test",
    config: {
      tags: ["me", GCMKeys.name],
      auth: "oauth",
      response: {status: {"204": Joi}},
      handler: function(req, rep) {
        var gcm = server.plugins.gcm
        req.auth.credentials.user.getGCMKeys().then(function(keys) {
          keys = _.map(keys, _.property("key"))
          if (keys.length === 0) return rep().code(204).type('application/json')
          var message = new gcm.Message({data: {type: "test"}})
          return gcm.send(message, keys).then(function() {
            rep().code(204).type('application/json')
          })
        }).catch(rep)
      }
    }
  })

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
