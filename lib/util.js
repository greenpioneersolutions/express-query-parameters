var _ = require('lodash')
var autoParse = require('auto-parse')

function whereObject (where, whereParameters, schema) {
  var output = {}
  output[where] = {}
  _.forEach(whereParameters, function (n, key) {
    if (key === '$equals') {
      try {
        output[where] = autoParse(n) // valueParser(settings.schemas[settings.modelNameCheck(_.replace(req.path, settings.options.routing.url, ''))].paths[where].instance, n)
      } catch (err) {
        console.log(where + '- The Where selector appears to be the problem', 'Where$equals', err)
      }
    } else if (key === 'find') {
      if (schema.indexOf(where) !== -1) {
        output[where] = autoParse(n) // new RegExp(_.escapeRegExp(autoParse(n)), 'i')
      } else {
        console.log(where + '- The Where Find is not in the schema - strict mode on ', 'WhereFind', 'err')
      }
    } else if (key === '$nin' || key === '$in' || key === '$all') {
      try {
        if (_.isArray(n)) {
          if (schema.indexOf(where) !== -1) {
            output[where][key] = autoParse(n)
          } else {
            console.log(where + '- The Where $nin $in $all is not in the schema - strict mode on ', 'Whereinall', 'err')
          }
        } else {
          if (schema.indexOf(where) !== -1) {
            output[where][key] = [autoParse(n)]
          } else {
            console.log(where + '- The Where $nin $in $all is not in the schema - strict mode on ', 'WhereEinall', 'err')
          }
        }
      } catch (err) {
        console.log(where + '- The Where selector appears to be the problem', 'Where-all', err)
      }
    } else {
      output[where][key] = autoParse(n)
    }
  })

  return output
}

function limitCheck (number, limit) {
  number = number << 0
  if (!number || number > limit || number === 0) {
    number = limit
  }
  return number
}

function sortCheck (sort) {
  // V Year  ^ Title        ^ ...
  //   1995    Bob           2
  //   1995    Bob           1
  //   1995    Alice
  //   1995    AAA
  //
  //   1993    Carol
  //   1993    Bob
  //
  //   1992    Dave
  //
  // sort=year&sort=-title
  //
  // sort: ["year", "-title"]
  // .sort([
  //  ["year", 1],
  //  ["title", -1]
  // ])
  if (_.isArray(sort)) {
    return _.map(sort, function (current) {
      var direction = 1
      if (_.startsWith(current, '-')) {
        direction = -1
        current = current.slice(1)
      }
      return [current, direction]
    })
  }
  return sort
}

function selectCheck (select, schema) {
  var selected = {}
  select = _.isArray(select) ? select : select.split(' ')

  _.forEach(select, function (current) {
    if (!_.includes(schema, current)) {
      return
    }

    var enabled = 1
    if (_.startsWith(current, '-')) {
      enabled = 0
      current = current.slice(1)
    }
    selected[current] = enabled
  })

  return selected
}

module.exports = {
  whereObject: whereObject,
  limitCheck: limitCheck,
  sortCheck: sortCheck,
  selectCheck: selectCheck
}
