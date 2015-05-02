var P = require("bluebird"),
  Hapi = require("hapi"),
  Boom = require("boom")

module.exports = function loadServer() {
  var server = new Hapi.Server({
    connections: {routes: {cors: {origin: ["*"]}}}
  })

  server.connection({
    port: process.env.FOODIE_HTTP_PORT || 3000
  })

  var register = P.promisify(server.register, server)

  var plugins = [
    register([
      {
        register: require("good"),
        options: {
          reporters: [{
            reporter: require("good-console"),
            events: {log: "*", response: "*", request: "*", error: "*"}
          }]
        }
      },
      require("./rest"),
      require("./db"),
      require("./handlers"),
      require("./oauth"),
      require("./storage")
    ]),
    register(require("../api"), {routes: {prefix: "/api"}})
  ]

  if (process.env.NODE_ENV == "development") plugins.push(register(require("blipp")))
  if (process.env.NODE_ENV != "test") plugins.push(register(require("./swagger")))

  return P.all(plugins).then(function() {
    return server
  })
}
