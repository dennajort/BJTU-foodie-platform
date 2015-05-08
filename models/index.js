"use strict"
var _ = require("lodash")

exports.doAssociations = function(db) {
  var m = db.models,
    Users = m.users,
    Restaurants = m.restaurants,
    Offers = m.offers,
    Coupons = m.coupons,
    RestaurantPictures = m.restaurant_pictures

  // Users - Restaurants 1:m
  Users.hasMany(Restaurants, {
    as: "Restaurants",
    foreignKey: "owner",
    onDelete: "SET NULL"
  })
  Restaurants.belongsTo(Users, {
    as: "Owner",
    foreignKey: "owner"
  })

  // Restaurants - Offers 1:m
  Restaurants.hasMany(Offers, {
    as: "Offers",
    foreignKey: "restaurant",
    onDelete: "SET NULL"
  })
  Offers.belongsTo(Restaurants, {
    as: "Restaurant",
    foreignKey: "restaurant"
  })

  // Offers - Coupons 1:m
  Offers.hasMany(Coupons, {
    as: "Coupons",
    foreignKey: "offer",
    onDelete: "SET NULL"
  })
  Coupons.belongsTo(Offers, {
    as: "Offer",
    foreignKey: "offer"
  })

  // Users - Coupons 1:m
  Users.hasMany(Coupons, {
    as: "Coupons",
    foreignKey: "owner",
    onDelete: "SET NULL"
  })
  Coupons.belongsTo(Users, {
    as: "Owner",
    foreignKey: "owner"
  })

  // Restaurants - RestaurantPictures 1:m
  Restaurants.hasMany(RestaurantPictures, {
    as: "Pictures",
    foreignKey: "restaurant",
    onDelete: "cascade",
    hooks: true
  })
  RestaurantPictures.belongsTo(Restaurants, {
    as: "Restaurant",
    foreignKey: "restaurant",
  })
}

exports.models = _.values(require("requireindex")(__dirname))
