var Joi = require("joi"),
  Boom = require("boom"),
  P = require("bluebird"),
  _ = require("lodash"),
  jwt = require("jsonwebtoken"),
  jwtVerifyAsync = P.promisify(jwt.verify, jwt)

var APP_SECRET = "secret",
  EXP_TIME = 60 * 60 * 24 * 2,
  EXP_TIME_REFRESH = 60 * 60 * 24 * 15

exports.register = function(server, options, next) {
  var Users = server.plugins.db.users

  var validateFunc = function(token, callback) {
    jwtVerifyAsync(token, APP_SECRET).then(function(data) {
      return Users.findOne(data.userId).then(function(user) {
        if (user === null) return callback(null, false)
        callback(undefined, true, {
          user: user,
          scope: data.scope || []
        })
      }).catch(function(e) {
        callback(e)
      })
    }).catch(function(e) {
      callback(null, false)
    })
  }

  server.route({
    path: "/oauth/access_token",
    method: "POST",
    config: {
      tags: ["oauth"],
      validate: {
        payload: {
          grant_type: Joi.string().valid(
            "password", "refresh_token").required(),
          username: Joi.string().when("grant_type",
            {is: "password", then: Joi.required(), otherwise: Joi.forbidden()}),
          password: Joi.string().when("grant_type",
            {is: "password", then: Joi.required(), otherwise: Joi.forbidden()}),
          refresh_token: Joi.string().when("grant_type",
            {is: "refresh_token", then: Joi.required(), otherwise: Joi.forbidden()}),
          scope: Joi.string()
        }
      },
      response: {
        schema: {
          access_token: Joi.string().required(),
          token_type: Joi.string().valid("bearer").required(),
          expires_in: Joi.number().integer().required(),
          refresh_token: Joi.string().required(),
          scope: Joi.array().required()
        }
      },
      handler: function(req, rep) {
        function generateTokens(id, scope) {
          var access_token = jwt.sign(
            {userId: id, scope: scope, type: "access_token"},
            APP_SECRET,
            {expiresInSeconds: EXP_TIME}
          )
          var refresh_token = jwt.sign(
            {userId: id, scope: scope, type: "refresh_token"},
            APP_SECRET,
            {expiresInSeconds: EXP_TIME_REFRESH}
          )
          rep({
            access_token: access_token,
            token_type: "bearer",
            expires_in: EXP_TIME,
            refresh_token: refresh_token,
            scope: scope
          })
        }

        function doError(error) {
          var err = new Boom.badRequest()
          err.output.payload.error = error
          rep(err)
        }

        var scope = (function(s) {
          if (!_.isString(s)) return []
          return s.split(",")
        })(req.payload.scope)

        if (req.payload.grant_type == "password") {
          Users.findOne({email: req.payload.username}).then(function(user) {
            if (user === null) return doError("invalid_grant")
            return Users.checkPassword(user, req.payload.password).then(function(ok) {
              if (ok) return generateTokens(user.id, scope)
              doError("invalid_grant")
            })
          }).catch(rep)
        } else if (req.payload.grant_type == "refresh_token"){
          jwtVerifyAsync(req.payload.refresh_token, APP_SECRET).then(function(data) {
            if (_.every(scope, function(s) {return _.includes(data.scope, s)})) {
              return generateTokens(data.id, scope)
            }
            doError("invalid_scope")
          }).catch(jwt.TokenExpiredError, function(err) {
            doError("invalid_grant")
          })
        } else {
          doError("unsupported_grant_type")
        }
      }
    }
  })

  server.register(require("hapi-auth-bearer-token"), function(err) {
    if (err) return next(err)
    server.auth.strategy("oauth", "bearer-access-token", {validateFunc: validateFunc})
    next()
  })
}

exports.register.attributes = {
  name: "oauth",
  dependencies: ["db"]
}
