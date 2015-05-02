var Sequelize = require("sequelize"),
  ValidationError = Sequelize.ValidationError,
  Umzug = require("umzug"),
  Boom = require("boom"),
  _ = require("lodash"),
  path = require("path")

exports.register = function(server, options, next) {
  server.ext("onPostHandler", function(req, rep) {
    if (req.response instanceof ValidationError) {
      var b = Boom.badRequest("Database validation error")
      b.output.payload.validation = {"keys": req.response.fields}
      return rep(b)
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

  umzug.up().then(function(migrations) {
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
