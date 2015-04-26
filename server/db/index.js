var Sequelize = require("sequelize"),
    ValidationError = Sequelize.ValidationError,
    Boom = require("boom"),
    _ = require("lodash"),
    Joi = require("joi")

exports.register = function(server, options, next) {
  var c = require("./config"),
      sequelize = new Sequelize(c.database, c.username, c.password, c.options),
      schemas = {}

  require("../../models")(server, sequelize)
  _.forIn(sequelize.models, function(model, name) {
    tmp = {}
    _.forIn(model.attributes, function(attr, key) {
      tmp[key] = (function() {
        switch (attr.type.key) {
          case "STRING": case "TEXT": case "UUID":
            return Joi.string().allow("")
          case "INTEGER": case "BIGINT":
            return Joi.number().integer()
          case "FLOAT": case "DECIMAL":
            return Joi.number()
          case "DATE":
            return Joi.date()
          case "BOOLEAN":
            return Joi.boolean()
          default:
            return Joi.any()
        }
      })()
    })
    schemas[name] = Joi.object(tmp)
      .meta({className: name})
      .options({allowUnknown: true, stripUnknown: true})
  })

  server.ext("onPostHandler", function(req, rep) {
    if (req.response instanceof ValidationError) {
      var b = Boom.badRequest("Database validation error")
      b.output.payload.validation = {"keys": req.response.fields}
      return rep(b)
    }
    rep.continue()
  })

  sequelize.sync().then(function() {
    server.expose("db", sequelize)
    server.expose("models", sequelize.models)
    server.expose("schemas", schemas)
    next()
  }).catch(next)
}

exports.register.attributes = {
  name: "db"
}
