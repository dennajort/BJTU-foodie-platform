"use strict"
module.exports = {
  up: function(migration, DataTypes) {
    return migration.addColumn("restaurants", "phone", {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ""
    }).then(function() {
      return migration.addColumn("restaurants", "email", {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "example@example.com"
      })
    })
  },

  down: function(migration) {
    return migration.removeColumn('restaurants', "phone").then(function() {
      return migration.removeColumn("restaurants", "email")
    })
  }
}
