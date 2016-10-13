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
    return {
      lean: function (cb) {
        cb(null, query.lean ? autoParse(query.lean) : self.options.query.lean)
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
  self.options = _.merge(self.options, data)
}
Build.prototype.parse = function (parse, cb) {
  var options = this.options
  var self = this
  if (_.isEmpty(parse)) {
    if (cb) return cb(self.options.query)
    return self.options.query
  }

  var tasks = self.tasks(parse)
  if (this.options.settings.mongoose) _.merge(tasks, self.mongoose(parse))
  if (this.options.settings.sql) _.merge(tasks, self.sql(parse))
  var response = autoSync(
    tasks
    , function (err, result) {
      if (err) console.log(err)
      return _.merge(options, result)
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

// function errorHandler (errValue, field, value, queryParameters, defaults) { // ERRORHANDLER
//   setOrGet(queryParameters.error, field, []).push({
//     message: defaults.errorMessage,
//     value: errValue
//   })
//   return value
// }

// function warningHandler (warnValue, field, value, queryParameters, defaults) { // warningHandler
//   setOrGet(queryParameters.warning, field, []).push({
//     message: defaults.errorMessage,
//     value: errValue
//   })
//   return value
// }

function build (options) {
  if (options === undefined || (typeof options === 'object' && options !== null)) {
    return new Build(options)
  }

  throw new TypeError('Expected object for argument options but got ' + options)
}

module.exports = build
