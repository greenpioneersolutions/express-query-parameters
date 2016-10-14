var _ = require('lodash')

// limit: 10
function limitCheck (number, limit) {
  number = number << 0
  if (!number || number > limit || number === 0) {
    number = limit
  }
  return number
}

// sort: ["year", "-title"]
// .sort([
//  ["year", 1],
//  ["title", -1]
// ])
function sortCheck (sort) {
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

// select: 'test name content'
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
  limitCheck: limitCheck,
  sortCheck: sortCheck,
  selectCheck: selectCheck
}
