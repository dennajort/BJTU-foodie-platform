"use strict"
module.exports = {
  up: function(migration, DataTypes) {
    return migration.createTable("gcm_keys", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      owner: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: "users",
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },
      key: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      }
    })
  },

  down: function(migration) {
    return migration.dropTable("gcm_keys")
  }
}
