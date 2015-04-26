var Joi = require("joi")

module.exports = function(server) {
  var Restaurants = server.plugins.dogwater.restaurants

  // Restaurant getters
  server.route([
    {
      path: "/restaurants",
      method: "GET",
      config: {
        description: "Get Restaurants",
        tags: ["Restaurants"],
        response: {schema: Joi.array().items(Restaurants.toJoi())},
        handler: {bedwetter: {}}
      }
    },
    {
      path: "/restaurants/{id}",
      method: "GET",
      config: {
        description: "Get one Restaurant",
        tags: ["Restaurants"],
        response: {schema: Restaurants.toJoi()},
        validate: {
          params: {id: Joi.string().required()}
        },
        handler: {bedwetter: {}}
      }
    },
    {
      path: "/users/{id}/restaurants",
      method: "GET",
      config: {
        description: "Get Restaurants of User",
        tags: ["Restaurants", "Users"],
        validate: {
          params: {id: Joi.string().required()}
        },
        response: {schema: Joi.array().items(Restaurants.toJoi())},
        handler: {bedwetter: {}}
      }
    }
  ])

  // Restaurant setters
  server.route([
    {
      path: "/restaurants",
      method: "POST",
      config: {
        description: "Add Restaurant",
        tags: ["Restaurants"],
        response: {schema: Restaurants.toJoi()},
        validate: {
          payload: {
            name: Joi.string().required(),
            description: Joi.string().default(""),
            address: Joi.string().required(),
            longitude: Joi.number().required(),
            latitude: Joi.number().required()
          }
        },
        auth: "oauth",
        handler: {bedwetter: {
          actAsUser: true,
          setOwner: true,
          requireOwner: true
        }}
      }
    }
  ])
}
