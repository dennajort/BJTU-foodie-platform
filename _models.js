var P = require("bluebird"),
  bcrypt = require("bcrypt"),
  hashAsync = P.promisify(bcrypt.hash),
  compareAsync = P.promisify(bcrypt.compare),
  Sequelize = require("sequelize"),
  STRING = Sequelize.STRING,
  INTEGER = Sequelize.INTEGER,
  TEXT = Sequelize.TEXT,
  FLOAT = Sequelize.FLOAT

module.exports = function(server, db) {
  var User = db.define("User", {
    username: {
      type: STRING,
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    email: {
      type: STRING,
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: true,
        isEmail: true
      }
    },
    password: {
      type: STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    }
  }, {
    instanceMethods: {
      toJSON: function() {
        var user = Sequelize.Instance.prototype.toJSON.call(this)
        delete user.password
        return user
      },
      setPassword: function(passwd) {
        return hashAsync(passwd, 10).bind(this).then(function(enc_passwd) {
          this.password = enc_passwd
        })
      },
      checkPassword: function(passwd) {
        return compareAsync(passwd, this.password)
      }
    }
  })

  var Restaurant = db.define("Restaurant", {
    name: {
      type: STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    description: {
      type: TEXT
    },
    longitude: {
      type: FLOAT,
      allowNull: false
    },
    lagitude: {
      type: FLOAT,
      allowNull: false
    },
    address: {
      type: STRING,
      allowNull: false
    }
  })

  var RestaurantPicture = db.define("RestaurantPicture", {
    path: {
      type: STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    }
  }, {
    instanceMethods: {
      toJSON: function() {
        var pic = Sequelize.Instance.prototype.toJSON.call(this)
        delete pic.path
        return pic
      }
    }
  })

  User.hasMany(Restaurant, {foreignKey: "OwnerId"})

  Restaurant.hasMany(RestaurantPicture, {as: "Pictures"})
}
