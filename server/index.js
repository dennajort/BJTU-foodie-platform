var P = require("bluebird"),
    Hapi = require("hapi"),
    requireIndex = require("requireindex"),
    path = require("path"),
    _ = require("lodash")

function loadSwagger(server) {
  return new P(function(resolve, reject) {
    server.register(require("./swagger"), function(err) {
      if (err) return reject(err)
      resolve(server)
    })
  })
}

function loadApi(server) {
  return new P(function(resolve, reject) {
    server.register(
      require("../api"),
      {routes: {prefix: "/api"}},
      function(err) {
        if (err) return reject(err)
        if (process.env.NODE_ENV == "test") return resolve(server)
        resolve(loadSwagger(server))
      }
    )
  })
}

module.exports = function loadServer() {
  return new P(function(resolve, reject) {
    var server = new Hapi.Server({
      connections: {routes: {cors: {origin: ["*"]}}}
    }), plugins = []

    server.connection({
      port: process.env.ELOVIZ_HTTP_PORT || 3000
    })

    plugins.push({
      register: require("good"),
      options: {
        reporters: [{
          reporter: require("good-console"),
          events: {log: "*", response: "*", request: "*", error: "*"}
        }]
      }
    })

    plugins.push({
      register: require("dogwater"),
      options: {
        connections: {
          "local": {
            adapter: "sails-disk"
          }
        },
        adapters: {
          "sails-disk": require("sails-disk")
        },
        models: require("../models")
      }
    })

    plugins.push(require("./handlers"))
//    plugins.push(require("./db"))
    plugins.push(require("./auth"))
    plugins.push(require("./rest"))

    if(process.env.NODE_ENV == "development") plugins.push(require("blipp"))

    server.register(plugins, function(err) {
      if (err) return reject(err)
      resolve(loadApi(server))
    })
  })
}
