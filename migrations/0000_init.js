"use strict"
module.exports = {
  up: function(migration) {
    return migration.dropAllTables()
  },

  down: function() {
    return Promise.resolve()
  }
}
