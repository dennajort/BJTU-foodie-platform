var Joi = require("joi"),
  _ = require("lodash"),
  Boom = require("boom")

exports.register = function(server, options, done) {
  server.dependency("db", function(server, next) {
    function getOwnerFromAuth(req) {
      return req.auth.credentials.user.id
    }

    server.expose({
      findAll: function(o) {
        var m = o.model
        var query = m.queryJoi()
        query.limit = Joi.number().integer()
        query.offset = Joi.number().integer()
        return {
          path: o.path,
          method: "GET",
          config: {
            description: `Get ${m.name}`,
            tags: [m.name],
            response: {schema: Joi.array().items(m.toJoi())},
            validate: {query: query},
            auth: o.auth || false,
            handler: function(req, rep) {
              var where = _.omit(req.query, ["limit", "offset"])
              m.findAll({
                where: where,
                limit: req.limit,
                offset: req.offset
              }).then(function(entries) {
                rep(entries)
              }).catch(rep)
            }
          }
        }
      },
      findOne: function(o) {
        var m = o.model
        return {
          path: o.path,
          method: "GET",
          config: {
            description: `Get one ${m.name}`,
            tags: [m.name],
            response: {schema: m.toJoi()},
            validate: {params: {id: Joi.number().integer().required()}},
            auth: o.auth || false,
            handler: function(req, rep) {
              m.findOne(req.params.id).then(function(entry) {
                if (entry === null) throw Boom.notFound()
                rep(entry)
              }).catch(rep)
            }
          }
        }
      },
      findRelated: function(o) {
        var m = o.model
        var pm = o.parent
        var query = _.omit(m.queryJoi(), o.fk)
        query.limit = Joi.number().integer()
        query.offset = Joi.number().integer()
        return {
          path: o.path,
          method: "GET",
          config: {
            description: `Get ${m.name} of one ${pm.name}`,
            tags: [m.name, pm.name],
            response: {schema: Joi.array().items(m.toJoi())},
            validate: {
              query: query,
              params: {id: Joi.number().integer().required()}
            },
            auth: o.auth || false,
            handler: function(req, rep) {
              var where = _.omit(req.query, ["limit", "offset"])
              where[o.fk] = req.params.id
              m.findAll({
                where: where,
                limit: req.limit,
                offset: req.offset
              }).then(function(entries) {
                rep(entries)
              }).catch(rep)
            }
          }
        }
      },
      create: function(o) {
        var m = o.model
        var tags = [m.name]
        if (o.setOwner) tags.push("me")
        return {
          path: o.path,
          method: "POST",
          config: {
            description: `Create a ${m.name}`,
            tags: tags,
            response: {schema: m.toJoi()},
            validate: {payload: o.payload},
            auth: o.auth || false,
            handler: function(req, rep) {
              var payload = req.payload
              if (o.setOwner) payload[o.ownerField] = getOwnerFromAuth(req)
              m.create(payload).then(function(entry) {
                rep(entry)
              }).catch(rep)
            }
          }
        }
      }
    })
    next()
  })
  done()
}

exports.register.attributes = {
  name: "rest",
  dependencies: ["db"]
}
