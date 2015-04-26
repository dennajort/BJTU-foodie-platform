var Joi = require("joi"),
  Boom = require("boom"),
  P = require("bluebird")

exports.register = function(server, options, next) {
  var db = server.plugins.db

  server.expose("find", function(o) {
    var Model = o.model
    var query = {
      limit: Joi.number().integer().default(30),
      skip: Joi.number().integer().default(0)
    }

    return {
      method: "GET",
      path: o.path,
      config: {
        auth: o.auth || false,
        description: `Get ${Model.options.name.plural}`,
        tags: [Model.options.name.singular],
        response: {
          schema: Joi.array().items(db.schemas[Model.options.name.singular])
        },
        validate: {
          query: query
        },
        handler: function(req, rep) {
          Model.findAll({
            limit: req.query.limit,
            offset: req.query.skip
          }).then(function(models) {
            rep(models)
          }).catch(rep)
        }
      }
    }
  })

  server.expose("findOne", function(o) {
    var Model = o.model

    return {
      method: "GET",
      path: o.path,
      config: {
        auth: o.auth || false,
        description: `Get ${Model.options.name.singular}`,
        tags: [Model.options.name.singular],
        response: {
          schema: db.schemas[Model.options.name.singular]
        },
        validate: {
          params: {id: Joi.string().required()}
        },
        handler: function(req, rep) {
          Model.findOne(req.params.id).then(function(entry) {
            rep(entry || Boom.notFound())
          }).catch(rep)
        }
      }
    }
  })

  server.expose("create", function(o) {
    var Model = o.model

    var preBuild = o.preBuild || function(req, rep) {
      return P.resolve()
    }

    var postBuild = o.postBuild || function(req, rep, entry) {
      return P.resolve(entry)
    }

    return {
      method: "POST",
      path: o.path,
      config: {
        auth: o.auth || false,
        description: `Create a ${Model.options.name.singular}`,
        tags: [Model.options.name.singular],
        response: {
          schema: db.schemas[Model.options.name.singular]
        },
        validate: {payload: o.payload},
        handler: function(req, rep) {
          preBuild(req, rep).then(function() {
            return postBuild(Model.build(req.params.payload)).then(function(entry) {
              return entry.save().then(function(e) {
                rep(e)
              })
            })
          }).catch(rep)
        }
      }
    }
  })

  server.expose("findChildren", function(o) {
    var ParentModel = o.parentModel
    var ChildModel = o.childModel
    var query = {
      limit: Joi.number().integer().default(30),
      skip: Joi.number().integer().default(0)
    }

    return {
      method: "GET",
      path: o.path,
      config: {
        auth: o.auth || false,
        description: `Get ${ChildModel.options.name.plural} of one ${ParentModel.options.name.singular}`,
        tags: [ParentModel.options.name.singular, ChildModel.options.name.singular],
        response: {
          schema: Joi.array().items(db.schemas[ChildModel.options.name.singular])
        },
        validate: {
          query: query,
          params: {
            id: Joi.string().required()
          }
        },
        handler: function(req, rep) {
          ParendModel.findOne({
            where: {id: req.params.id},
            include: [{
              model: ChildModel
            }]})
          Model.findAll({
            limit: req.query.limit,
            offset: req.query.skip
          }).then(function(models) {
            rep(models)
          }).catch(rep)
        }
      }
    }
  })

  next()
}

exports.register.attributes = {
  name: "rest",
  dependencies: ["db", "generator"]
}
