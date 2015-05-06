var _ = require("lodash"),
  Joi = require("joi")

function addCommon(d, v) {
  if (d.flags && d.flags.default) {
    v.default = d.flags.default
  }
  if (_.isArray(d.valids)) {
    v.enum = d.valids
  }
  return v
}

function joiBoolean(d) {
  return addCommon(d, {type: "boolean"})
}

function joiString(d) {
  return addCommon(d, {type: "string"})
}

function joiNumber(d) {
  var rules = _.isArray(d.rules) ? d.rules : [],
      isInteger = _.some(rules, function(rule) {
        return Boolean(rule.name == "integer")
      })
  return addCommon(d, {type: isInteger ? "integer" : "number"})
}

function joiArray(d) {
  var items = (function(i) {
    if (_.isArray(i) && i.length > 0) return joiChoose(i[0])
    return {type: "string"}
  })(d.items)
  return addCommon(d, {type: "array", items: items})
}

function joiObject(d) {
  var prop = {}
  if (_.isObject(d.children)) {
    _.forIn(d.children, function(val, key) {
      prop[key] = joiChoose(val)
    })
  }
  var v = {type: "object", properties: prop, required: _.keys(prop)}
  return addCommon(d, v)
}

function joiDate(d) {
  var v = {type: "string", format: "date-time"}
  return addCommon(d, v)
}

function joiAlternatives(d) {
  return joiString({})
}

function joiChoose(d) {
  switch (d.type) {
    case "object": return joiObject(d)
    case "array": return joiArray(d)
    case "number": return joiNumber(d)
    case "boolean": return joiBoolean(d)
    case "string": return joiString(d)
    case "date": return joiDate(d)
    case "alternatives": return joiAlternatives(d)
    default: return undefined
  }
}

module.exports = function joiToSwagger(j) {
  return joiChoose((_.isObject(j) && j.isJoi === true) ? j.describe() : Joi.object(j).describe())
}
