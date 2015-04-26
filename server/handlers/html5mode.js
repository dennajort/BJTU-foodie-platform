var Boom = require("boom"),
    path = require("path"),
    fs = require("fs"),
    _ = require("lodash")

exports.register = function (server, options, next) {
  server.handler("html5mode", function(route, options) {
    var filename = options.filename || "index.html",
        directory = options.directory || ".",
        ignore = _.isRegExp(options.ignore) ? options.ignore : undefined

    return function(req, rep) {
      var upath = _.values(req.params)[0] || ""
      if (ignore !== undefined && ignore.test(upath)) {
        return rep(new Boom.notFound())
      }
      fs.stat(path.join(directory, upath), function(err, stats) {
        function serve(p) {
          rep.file(path.join(directory, p))
        }

        if (err || !stats.isFile()) return serve(filename)
        serve(upath)
      })
    }
  })
  next()
}

exports.register.attributes = {
  name: "html5mode"
}
