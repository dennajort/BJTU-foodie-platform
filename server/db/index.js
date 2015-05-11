"use strict"
var Sequelize = require("sequelize"),
  Umzug = require("umzug"),
  Boom = require("boom"),
  _ = require("lodash"),
  path = require("path")

exports.register = function(server, options, next) {
  function toJSON(v) {
    return (v === undefined) ? v : ((_.isFunction(v.toJSON)) ? v.toJSON() : v)
  }

  server.ext("onPostHandler", function(req, rep) {
    var res = req.response, source = res.source
    if (res instanceof Sequelize.ValidationError) {
      let b = Boom.badRequest("Database validation error")
      b.output.payload.validation = {"keys": res.fields}
      return rep(b)
    } else if (res.statusCode == 200 && source !== undefined && source !== null) {
      if (_.isFunction(source.toJSON)) return rep(source.toJSON())
      if (_.isArray(source)) return rep(_.map(source, toJSON))
      if (_.isPlainObject(source)) return rep(_.mapValues(source, toJSON))
    }
    rep.continue()
  })

  var c = require("./config")
  var sequelize = new Sequelize(c.database, c.username, c.password, c.options)
  var umzug = new Umzug({
    storage: "sequelize",
    storageOptions: {
      sequelize: sequelize
    },
    migrations: {
      params: [sequelize.getQueryInterface(), Sequelize],
      path: path.join(__dirname, "..", "..", "migrations")
    }
  })

  umzug.up().then(function() {
    var models = require("../../models")
    _.forEach(models.models, function(f) {
      f(sequelize, server)
    })
    models.doAssociations(sequelize, server)
    return sequelize.sync().then(function() {
      _.forIn(sequelize.models, function(v, k) {
        server.expose(k, v)
      })
      next()
    })
  }).catch(next)
}

exports.register.attributes = {
  name: "db"
}
