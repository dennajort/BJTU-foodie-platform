"use strict"
var Joi = require("joi"),
  _ = require("lodash"),
  Boom = require("boom"),
  P = require("bluebird")

exports.register = function(server, options, done) {
  server.dependency("db", function(server, next) {
    function getOwnerFromAuth(req) {
      return req.auth.credentials.user.id
    }

    function parseOrder(order) {
      return _(order).map(function(v) {
        var tmp = v.trim()
        if (tmp.lengt === 0) return
        tmp = tmp.split(/\s+/)
        switch (tmp.length) {
          case 1: return tmp[0]
          case 2: return tmp
          default: return undefined
        }
      }).filter(function(v) {
        return v !== undefined
      }).value()
    }

    server.expose({
      findAll: function(o) {
        var m = o.model
        var tags = [m.name]
        if (o.asOwner) tags.push("me")
        var query = m.queryJoi()
        query.limit = Joi.number().integer()
        query.offset = Joi.number().integer()
        query.order = Joi.array().items(Joi.string()).single(true)
        return {
          path: o.path,
          method: "GET",
          config: {
            description: `Get ${m.name}`,
            tags: tags,
            response: {schema: Joi.array().items(m.toJoi())},
            validate: {query: query},
            auth: o.auth || false,
            handler: function(req, rep) {
              var where = _.omit(req.query, ["limit", "offset", "order"])
              if (o.asOwner) where[o.ownerField] = getOwnerFromAuth(req)
              m.findAll({
                where: where,
                limit: req.query.limit,
                offset: req.query.offset,
                order: parseOrder(req.query.order)
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
        query.order = Joi.array().items(Joi.string()).single(true)
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
              var where = _.omit(req.query, ["limit", "offset", "order"])
              where[o.fk] = req.params.id
              m.findAll({
                where: where,
                limit: req.query.limit,
                offset: req.query.offset,
                order: parseOrder(req.query.order)
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
        var preCreate = o.preCreate || P.resolve
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
              preCreate(payload).then(function(new_payload) {
                return m.create(new_payload).then(function(entry) {
                  rep(entry)
                })
              }).catch(rep)
            }
          }
        }
      },
      destroyOne: function(o) {
        var m = o.model
        var tags = [m.name]
        if (o.asOwner) tags.push("me")
        return {
          path: o.path,
          method: "DELETE",
          config: {
            description: `Delete a ${m.name}`,
            tags: tags,
            validate: {params: {id: Joi.number().integer().required()}},
            response: {status: {"204": Joi}},
            auth: o.auth || false,
            handler: function(req, rep) {
              m.findOne(req.params.id).then(function(entry) {
                if (entry === null) throw Boom.notFound()
                if (o.asOwner) return entry.isOwner(getOwnerFromAuth(req)).then(function(ok) {
                  if (ok) return entry
                  throw Boom.unauthorized()
                })
                return entry
              }).then(function(entry) {
                return entry.destroy().then(function() {
                  rep().code(204).type('application/json')
                })
              }).catch(rep)
            }
          }
        }
      },
      updateOne: function(o) {
        var m = o.model
        var tags = [m.name]
        if (o.asOwner) tags.push("me")
        return {
          path: o.path,
          method: "PUT",
          config: {
            description: `Update a ${m.name}`,
            tags: tags,
            validate: {
              params: {id: Joi.number().integer().required()},
              payload: o.payload
            },
            response: {schema: m.toJoi()},
            auth: o.auth || false,
            handler: function(req, rep) {
              m.findOne(req.params.id).then(function(entry) {
                if (entry === null) throw Boom.notFound()
                if (o.asOwner) return entry.isOwner(getOwnerFromAuth(req)).then(function(ok) {
                  if (ok) return entry
                  throw Boom.unauthorized()
                })
                return entry
              }).then(function(entry) {
                return entry.update(req.payload).then(function(upEntry) {
                  rep(upEntry)
                })
              }).catch(rep)
            }
          }
        }
      },
      createRelated: function(o) {
        var m = o.model
        var pm = o.parent
        var tags = [m.name, pm.name]
        if (o.asOwner) tags.push("me")
        var preCreate = o.preCreate || P.resolve
        return {
          path: o.path,
          method: "POST",
          config: {
            description: `Create a ${m.name} of one ${pm.name}`,
            tags: tags,
            response: {schema: m.toJoi()},
            validate: {
              payload: o.payload,
              params: {id: Joi.number().integer().required()}
            },
            auth: o.auth || false,
            handler: function(req, rep) {
              var payload = req.payload
              pm.findOne(req.params.id).then(function(mypm) {
                if (mypm === null) throw Boom.notFound()
                if (o.asOwner) return pm.isOwner(getOwnerFromAuth(req)).then(function(ok) {
                  if (ok) return mypm
                  throw Boom.unauthorized()
                })
                return mypm
              }).then(function(mypm) {
                payload[o.fk] = mypm.id
                return preCreate(payload).then(function(new_payload) {
                  return m.create(new_payload).then(function(entry) {
                    rep(entry)
                  })
                })
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
