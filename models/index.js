var _ = require("lodash")

exports.doAssociations = function(db) {
  var Users = db.models.users,
    Restaurants = db.models.restaurants

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
}

exports.models = _.values(require("requireindex")(__dirname))
