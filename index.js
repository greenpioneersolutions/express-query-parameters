'use strict'

var _ = require('lodash')
var autoParse = require('auto-parse')
// var setOrGet = require('set-or-get')
var auto = require('run-auto')

function autoSync (tasks, cb) {
  var result = {}
  var error = null
  _.forEach(tasks, function (taskFn, taskName) {
    taskFn(function (err, data) {
      error = err
      result[taskName] = data
    })
    if (error) { return false }
  })

  if (cb) {
    return cb(error, result)
  } else if (error) {
    throw error
  }

  return result
}

function Build (options) {
  var self = this
  self.options = _.merge(require('./lib/options.js'), options)
  self.schema = self.options.settings.schema ? _.uniq(self.options.settings.schema) : []
  self.schemaSort = []
  _.forEach(self.schema, function (key) {
    self.schemaSort.push(key, '-' + key)
  })
  self.tasks = function (query) {
    return {
      filter: function (cb) {
        // { content: "test", limit: 42 }
        var filter = {}
        _.forEach(query, function (a, keys) {
          if (_.includes(self.schema, keys)) {
            // TODO orderId: "012345"
            filter[keys] = autoParse(a)
          }
        })
        cb(null, filter)
      },
      skip: function (cb) {
        cb(null, query.skip ? autoParse(query.skip) : self.options.query.skip)
      },
      sort: function (cb) {
        cb(null, query.sort ? sortCheck(query.sort) : self.options.query.sort)
      },
      limit: function (cb) {
        cb(null, query.limit ? limitCheck(query.limit, self.options.query.limit) : self.options.query.limit)
      },
      select: function (cb) {
        cb(null, query.select ? selectCheck(query.select, self.schema) : self.options.query.select)
      }
    }
  }
  self.mongoose = function (query) {
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
        cb(null, query.lean ? autoParse(query.lean) : self.options.query.lean)
      },
      gt: function (cb) {
        cb(null, query.gt ? whereParameter(query.gt, '$gt') : self.options.mongoose.gt)
      },
      lt: function (cb) {
        cb(null, query.lt ? whereParameter(query.lt, '$lt') : self.options.mongoose.lt)
      },
      gte: function (cb) {
        cb(null, query.gte ? whereParameter(query.gte, '$gte') : self.options.mongoose.gte)
      },
      lte: function (cb) {
        cb(null, query.lte ? whereParameter(query.lte, '$lte') : self.options.mongoose.lte)
      },
      in: function (cb) {
        cb(null, query.in ? whereParameter(query.in, '$in') : self.options.mongoose.in)
      },
      ne: function (cb) {
        cb(null, query.ne ? whereParameter(query.ne, '$ne') : self.options.mongoose.ne)
      },
      nin: function (cb) {
        cb(null, query.nin ? whereParameter(query.nin, '$nin') : self.options.mongoose.nin)
      },
      regex: function (cb) {
        cb(null, query.regex ? whereParameter(query.regex, '$regex') : self.options.mongoose.regex)
      },
      options: function (cb) {
        cb(null, query.options ? whereParameter(query.options, '$options') : self.options.mongoose.options)
      },
      size: function (cb) {
        cb(null, query.size ? whereParameter(query.size, '$size') : self.options.mongoose.size)
      },
      all: function (cb) {
        cb(null, query.all ? whereParameter(query.all, '$all') : self.options.mongoose.all)
      },
      equals: function (cb) {
        cb(null, query.equals ? whereParameter(query.equals, '$equals') : self.options.mongoose.equals)
      },
      find: function (cb) {
        cb(null, query.find ? whereParameter(query.find, 'find') : self.options.mongoose.find)
      },
      or: function (cb) {
        cb(null, query.or ? andOrNorParameter(query.or, '$or') : self.options.mongoose.or)
      },
      nor: function (cb) {
        cb(null, query.nor ? andOrNorParameter(query.nor, '$nor') : self.options.mongoose.nor)
      },
      and: function (cb) {
        cb(null, query.and ? andOrNorParameter(query.and, '$and') : self.options.mongoose.and)
      },
      aggregate: function (cb) {
        cb(null, query.aggregate ? aggregateCheck(query.aggregate) : self.options.mongoose.aggregate)
      },
      populateId: function (cb) {
        cb(null, query.populateId ? populateCheck(query.populateId, self.options, 'populateId') : self.options.mongoose.populateId) // models
      },
      populateItems: function (cb) {
        cb(null, query.populateItems ? populateCheck(query.populateItems, self.options, 'populateItems') : self.options.mongoose.populateItems) // settings.schema
      },
      deepPopulate: function (cb) {
        cb(null, query.deepPopulate ? query.deepPopulate : self.options.mongoose.deepPopulate) // add settings.schema check for deepPop
      },
      where: function (cb) {
        cb(null, query.where || {})
      },
      whereParameters: function (cb) {
        cb(null, where)
      }
    }
  }
  self.sql = function (query) {
    return {
      sql: function (cb) {
        cb(null, null)
      }
    }
  }
}

Build.prototype.config = function (data) {
  var self = this
  if (data)self.options = _.merge(self.options, data)
  return self.options
}
Build.prototype.parse = function (parse, cb) {
  var options = this.options
  var defaults = _.cloneDeep(this.options.query)
  if (this.options.settings.mongoose) _.merge(defaults, options.mongoose)
  if (this.options.settings.sql) _.merge(defaults, options.sql)
  var self = this
  if (_.isEmpty(parse)) {
    if (cb) return cb(defaults)
    return defaults
  }
  parse = autoParse(parse)
  var tasks = self.tasks(parse)
  if (this.options.settings.mongoose) _.merge(tasks, self.mongoose(parse))
  if (this.options.settings.sql) _.merge(tasks, self.sql(parse))
  var response = autoSync(
    tasks
    , function (err, result) {
      if (err) console.log(err)
      if (options.settings.mongoose) {
        if (result.whereParameters.used) {
          // result.where = result.whereParameters
          // call function
          if (!_.isArray(result.where)) {
            result.where = whereObject(result.where, result.whereParameters.parameters, options.settings.schema)
          } else {
            result.where = whereObject(result.where[0] || '', result.whereParameters.parameters, options.settings.schema)
            console.log('The Where selector appears to be the problem. Looks like we got a multiple wheres but expect a where', 'Where', err)
          }
        }
        delete result.whereParameters
      }
      return _.merge(defaults, result)
    })
  if (cb) {
    return cb(response)
  } else {
    return response
  }
}
Build.prototype.query = function (params) {
  var options = this.options
  var self = this
  if (params) options = _.merge(options, params)

  return function (res, req, next) {
    if (_.isEmpty(req.query)) {
      req.queryParameters = options
      return next()
    }

    var tasks = self.tasks(req.query)
    if (this.options.settings.mongoose) _.merge(tasks, self.mongoose(req.query))
    if (this.options.settings.sql) _.merge(tasks, self.sql(req.query))
    auto(
      tasks
      , function (err, result) {
        if (err) console.log(err)
        req.queryParameters = _.merge(options, result)
        return next()
      })
  } // END OF RETURN
} // END OF QUERY

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
  var defaults = options.mongoose
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

function build (options) {
  if (options === undefined || (typeof options === 'object' && options !== null)) {
    return new Build(options)
  }

  throw new TypeError('Expected object for argument options but got ' + options)
}

module.exports = build
