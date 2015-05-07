"use strict"
module.exports = {
  up: function(migration, DataTypes) {
    return migration.createTable("coupons", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      owner: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: "users",
        onDelete: "SET NULL",
        onUpdate: "CASCADE"
      },
      offer: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: "offers",
        onDelete: "SET NULL",
        onUpdate: "CASCADE"
      },
      secret: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      used: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      }
    })
  },

  down: function(migration, DataTypes) {
    return migration.dropTable('coupons')
  }
}
