var _ = require("lodash")

exports.doAssociations = function(db) {
  var Users = db.models.users,
    Restaurants = db.models.restaurants,
    Offers = db.models.offers,
    Coupons = db.models.coupons

  // Users - Restaurants 1:m
  Users.hasMany(Restaurants, {
    as: "Restaurants",
    foreignKey: "owner",
    onDelete: "SET NULL"
  })
  Restaurants.belongsTo(Users, {
    as: "Owner",
    foreignKey: "owner",
    onDelete: "SET NULL"
  })

  // Restaurants - Offers 1:m
  Restaurants.hasMany(Offers, {
    as: "Offers",
    foreignKey: "restaurant",
    onDelete: "SET NULL"
  })
  Offers.belongsTo(Restaurants, {
    as: "Restaurant",
    foreignKey: "restaurant",
    onDelete: "SET NULL"
  })

  // Offers - Coupons 1:m
  Offers.hasMany(Coupons, {
    as: "Coupons",
    foreignKey: "offer",
    onDelete: "SET NULL"
  })
  Coupons.belongsTo(Offers, {
    as: "Offer",
    foreignKey: "offer",
    onDelete: "SET NULL"
  })

  // Users - Coupons 1:m
  Users.hasMany(Coupons, {
    as: "Coupons",
    foreignKey: "owner",
    onDelete: "SET NULL"
  })
  Coupons.belongsTo(Users, {
    as: "Owner",
    foreignKey: "owner",
    onDelete: "SET NULL"
  })
}

exports.models = _.values(require("requireindex")(__dirname))
