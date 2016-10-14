var _ = require('lodash')
var autoParse = require('auto-parse')

var OPTIONS = {
  populateId: '',
  populateItems: '',
  limitToPopulateId: '',
  limitToPopulateItems: '',
  deepPopulate: '',
  where: '',
  gt: false,
  gte: false,
  lte: false,
  lt: false,
  in: false,
  ne: false,
  nin: false,
  regex: false,
  options: false,
  size: false,
  all: false,
  equals: false,
  find: false,
  or: false,
  nor: false,
  and: false
}

function whereObject (where, whereParameters, schema) {
  var output = {}
  output[where] = {}
  _.forEach(whereParameters, function (n, key) {
    if (key === '$equals') {
      try {
        output[where] = autoParse(n)
      } catch (err) {
        console.log(where + '- The Where selector appears to be the problem', 'Where$equals', err)
      }
    } else if (key === 'find') {
      if (schema.indexOf(where) !== -1) {
        output[where] = autoParse(n) // new RegExp(_.escapeRegExp(autoParse(n)), 'i')
      } else {
        console.log(where + '- The Where Find is not in the schema ', 'WhereFind', 'err')
      }
    } else if (key === '$nin' || key === '$in' || key === '$all') {
      try {
        if (_.isArray(n)) {
          if (schema.indexOf(where) !== -1) {
            output[where][key] = autoParse(n)
          } else {
            console.log(where + '- The Where $nin $in $all is not in the schema ', 'Whereinall', 'err')
          }
        } else {
          if (schema.indexOf(where) !== -1) {
            output[where][key] = [autoParse(n)]
          } else {
            console.log(where + '- The Where $nin $in $all is not in the schema ', 'WhereEinall', 'err')
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

function andOrNorParameter (data, type) {
  if (data) {
    var queryParameters = {}
    queryParameters[type] = []
    _.forEach(data, function (o, key) {
      _.forEach(o, function (d) {
        var obj = {}
        obj[key] = autoParse(d)
        queryParameters[type].push(obj)
      })
    })
    return queryParameters
  } else {
    return false
  }
}

function aggregateCheck (aggregated) {
  var output = []

  _.forEach(aggregated, function (n, key) {
    var aggregate = {}
    aggregate[key] = autoParse(n) // valueParse(n)
    output.push(aggregate)
  })
  return output
}

function populateCheck (data, options, type) {
  var defaults = this.adapter.options
  var output = ''
  if (!_.isArray(data)) {
    data = data.replace(',', ' ').split(' ')
  }
  var defaultIds = []
  if (!_.isArray(defaults[type])) {
    defaultIds = defaults[type].replace(',', ' ').split(' ')
  }
  if (defaults[type]) {
    data = _.union(data, defaultIds)
  }
  _.forEach(data, function (n, key) {
    if (_.includes(options.settings.schema, n)) {
      output += n + ' '
    }
  })
  return _.trim(output)
}

function MongooseAdapter (query) {
  var self = this
  var where = {
    used: false,
    parameters: {}
  }
  function whereParameter (check, type) {
    if (!_.isUndefined(check)) {
      where.used = true
      where.parameters[type] = check
      return check
    }
    return false
  }
  return {
    lean: function (cb) {
      cb(null, query.lean ? autoParse(query.lean) : OPTIONS.lean)
    },
    gt: function (cb) {
      cb(null, query.gt ? whereParameter(query.gt, '$gt') : OPTIONS.gt)
    },
    lt: function (cb) {
      cb(null, query.lt ? whereParameter(query.lt, '$lt') : OPTIONS.lt)
    },
    gte: function (cb) {
      cb(null, query.gte ? whereParameter(query.gte, '$gte') : OPTIONS.gte)
    },
    lte: function (cb) {
      cb(null, query.lte ? whereParameter(query.lte, '$lte') : OPTIONS.lte)
    },
    in: function (cb) {
      cb(null, query.in ? whereParameter(query.in, '$in') : OPTIONS.in)
    },
    ne: function (cb) {
      cb(null, query.ne ? whereParameter(query.ne, '$ne') : OPTIONS.ne)
    },
    nin: function (cb) {
      cb(null, query.nin ? whereParameter(query.nin, '$nin') : OPTIONS.nin)
    },
    regex: function (cb) {
      cb(null, query.regex ? whereParameter(query.regex, '$regex') : OPTIONS.regex)
    },
    options: function (cb) {
      cb(null, query.options ? whereParameter(query.options, '$options') : OPTIONS.options)
    },
    size: function (cb) {
      cb(null, query.size ? whereParameter(query.size, '$size') : OPTIONS.size)
    },
    all: function (cb) {
      cb(null, query.all ? whereParameter(query.all, '$all') : OPTIONS.all)
    },
    equals: function (cb) {
      cb(null, query.equals ? whereParameter(query.equals, '$equals') : OPTIONS.equals)
    },
    find: function (cb) {
      cb(null, query.find ? whereParameter(query.find, 'find') : OPTIONS.find)
    },
    or: function (cb) {
      cb(null, query.or ? andOrNorParameter(query.or, '$or') : OPTIONS.or)
    },
    nor: function (cb) {
      cb(null, query.nor ? andOrNorParameter(query.nor, '$nor') : OPTIONS.nor)
    },
    and: function (cb) {
      cb(null, query.and ? andOrNorParameter(query.and, '$and') : OPTIONS.and)
    },
    aggregate: function (cb) {
      cb(null, query.aggregate ? aggregateCheck(query.aggregate) : OPTIONS.aggregate)
    },
    populateId: function (cb) {
      cb(null, query.populateId ? populateCheck.call(self, query.populateId, self.options, 'populateId') : OPTIONS.populateId) // models
    },
    populateItems: function (cb) {
      cb(null, query.populateItems ? populateCheck.call(self, query.populateItems, self.options, 'populateItems') : OPTIONS.populateItems) // settings.schema
    },
    deepPopulate: function (cb) {
      cb(null, query.deepPopulate ? query.deepPopulate : OPTIONS.deepPopulate) // add settings.schema check for deepPop
    },
    where: function (cb) {
      cb(null, query.where || {})
    },
    whereParameters: function (cb) {
      cb(null, where)
    }
  }
}

MongooseAdapter.afterParse = function (result, options) {
  if (result.or)_.merge(result.filter, result.or)
  if (result.and)_.merge(result.filter, result.and)
  if (result.nor)_.merge(result.filter, result.nor)
  if (result.whereParameters.used) {
    if (!_.isArray(result.where)) {
      result.where = whereObject(result.where, result.whereParameters.parameters, options.settings.schema)
    } else {
      result.where = whereObject(result.where[0] || '', result.whereParameters.parameters, options.settings.schema)
      console.log('The Where selector appears to be the problem. Looks like we got a multiple wheres but expect a where')
    }
  }
  delete result.whereParameters
}

MongooseAdapter.options = OPTIONS

module.exports = MongooseAdapter
