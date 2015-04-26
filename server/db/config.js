var path = require("path"),
    fs = require("fs-extra"),
    devSQLiteDir = path.join(__dirname, "..", "..", "run"),
    util = require("util")

if (process.env.NODE_ENV == "development") fs.mkdirsSync(devSQLiteDir)

module.exports = {
  database: "foodie",
  username: null,
  password: null,
  options:{
    logging: util.debuglog("app:db:sequelize"),
    dialect: "sqlite",
    storage: path.join(devSQLiteDir, "eloviz.db"),
    host: undefined,
    port: undefined
  }
}
