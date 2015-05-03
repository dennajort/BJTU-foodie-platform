var path = require("path"),
  fs = require("fs-extra"),
  devSQLiteDir = path.join(__dirname, "..", "..", "run"),
  util = require("util"),
  NODE_ENV = process.env.NODE_ENV

if (NODE_ENV == "development") fs.mkdirsSync(devSQLiteDir)

var configs = {
  "development": {
    database: "foodie",
    username: null,
    password: null,
    options: {
      dialect: "sqlite",
      storage: path.join(devSQLiteDir, "foodie.db")
    }
  },
  "production": {
    database: "foodie",
    username: "foodie",
    password: "foodie",
    options: {
      dialect: "postgres",
      logging: util.debuglog("app:db:sequelize"),
      host: process.env.POSTGRES_PORT_5432_TCP_ADDR,
      port: process.env.POSTGRES_PORT_5432_TCP_PORT
    }
  }
}

module.exports = configs[NODE_ENV] || configs.development
module.exports.options.define = {
  timestamps: false,
  freezeTableName: true
}
