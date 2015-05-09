"use strict"
module.exports = {
  up: function(migration, DataTypes) {
    return migration.addColumn("users", "picture", {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    })
  },

  down: function(migration) {
    return migration.removeColumn("users", "picture")
  }
}
