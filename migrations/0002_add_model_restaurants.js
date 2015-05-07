"use strict"
module.exports = {
  up: function(migration, DataTypes) {
    return migration.createTable("restaurants", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      short_description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      long_description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false
      },
      longitude: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      latitude: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      owner: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: "users",
        onDelete: "SET NULL",
        onUpdate: "CASCADE"
      }
    })
  },

  down: function(migration, DataTypes) {
    return migration.dropTable('restaurants')
  }
}
