module.exports = {
  up: function(migration, DataTypes) {
    return migration.createTable("restaurant_pictures", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      restaurant: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: "restaurants",
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },
      filename: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      main: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      }
    })
  },

  down: function(migration, DataTypes) {
    return migration.dropTable('restaurant_pictures')
  }
}
