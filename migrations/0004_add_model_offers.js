module.exports = {
  up: function(migration, DataTypes) {
    return migration.createTable("offers", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      restaurant: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: "restaurants",
        onDelete: "SET NULL",
        onUpdate: "CASCADE"
      },
      expiration_date: {
        type: DataTypes.DATE,
        allowNull: false
      },
      limit_coupon: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      remaining: {
        type: DataTypes.INTEGER,
        allowNull: true
      }
    })
  },

  down: function(migration, DataTypes) {
    return migration.dropTable('offers')
  }
}
