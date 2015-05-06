var _ = require("lodash"),
    path = require("path"),
    joiToSwagger = require("./joiToSwagger")

function makeResponse(route) {
  var res = route.settings.response,
      resps = {}
  if (!res) return
  _.forIn(res.status || {}, function(val, key) {
    if (_.isObject(val)) {
      resps[key.toString()] = {
        description: `${key} response`,
        schema: joiToSwagger(val)
      }
    }
  })
  if (!resps["200"] && _.isObject(res.schema)) {
    resps["200"] = {
      description: "200 response",
      schema: joiToSwagger(res.schema)
    }
  }
  return resps
}

function makeParameters(route) {
  var params = [],
      valid = route.settings.validate

  function shortener(j, where, required) {
    if (!_.isObject(j)) return
    var d = j.describe()
    _.forIn(d.children || {}, function(val, key) {
      var item = joiToSwagger(val)
      item.name = key
      item.in = where
      if (required === true || (val.flags && val.flags.presence == "required")) {
        item.required = true
      }
      params.push(item)
    })
  }

  shortener(valid.payload, "formData", false)
  shortener(valid.params, "path", true)
  shortener(valid.query, "query", false)
  shortener(valid.headers, "header", false)
  return params
}

function makePaths(server) {
  var paths = {}
  _.forEach(server.table(), function(conn) {
    _.forEach(conn.table, function(route) {
      var s = route.settings
      if (s.plugins.swagger === false) return
      var edpt = {
        parameters: makeParameters(route),
        responses: makeResponse(route),
        summary: _.isString(s.description) ? s.description : "",
        tags: _.isArray(s.tags) ? s.tags : []
      }
      edpt.description = (function(n) {
        if (_.isArray(n)) return n.join("\n")
        else if (_.isString(n)) return n
        else return ""
      })(s.notes)
      if (_.isString(s.id)) {
        edpt.operationId = s.id
      }
      if (paths[route.path] === undefined) paths[route.path] = {}
      paths[route.path][route.method] = edpt
    })
  })
  return paths
}

function makeHandler(server) {
  return function(req, rep) {
    rep({
      swagger: "2.0",
      info: {
        title: "Foodie API",
        version: require("../../package.json").version
      },
      paths: makePaths(server),
      securityDefinitions: {
        "oauth": {
          type: "oauth2",
          flow: "password",
          tokenUrl: "/oauth/access_token",
          scopes: {
            "api": "Access api"
          }
        }
      }
    })
  }
}

exports.register = function(server, options, next) {
  server.route({
    path: "/api/swagger.json",
    method: "GET",
    config: {plugins: {swagger: false}},
    handler: makeHandler(server)
  })

  server.route({
    path: "/api/docs/{f*}",
    method: "GET",
    handler: {
      directory: {
        path: path.join(__dirname, "ui"),
        index: true
      }
    },
    config: {plugins: {swagger: false}}
  })
  next()
}

exports.register.attributes = {
  name: "swagger"
}
