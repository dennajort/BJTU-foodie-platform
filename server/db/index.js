var Sequelize = require("sequelize"),
  Umzug = require("umzug"),
  Boom = require("boom"),
  _ = require("lodash"),
  path = require("path"),
  Joi = require("joi")

exports.register = function(server, options, next) {
  server.ext("onPostHandler", function(req, rep) {
    var res = req.response
    if (res instanceof Sequelize.ValidationError) {
      var b = Boom.badRequest("Database validation error")
      b.output.payload.validation = {"keys": res.fields}
      return rep(b)
    } else if (res.statusCode == 200) {
      var instanceArray = Joi.array().items(Joi.object().type(Sequelize.Instance).required())
      if (res.source === undefined) {
      } else if (res.source instanceof Sequelize.Instance) {
        return rep(req.response.source.toJSON())
      } else if (instanceArray.validate(res.source).error === null) {
        return rep(_.map(res.source, function(e) {return e.toJSON()}))
      }
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
