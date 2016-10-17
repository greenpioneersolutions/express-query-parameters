'use strict'

var _ = require('lodash')
var autoParse = require('auto-parse')
var util = require('./lib/util')
var fs = require('fs')
var Path = require('path')

var DEFAULT_OPTIONS = require('./lib/options.js')
var PATHadapterS = __dirname + '/lib/adapters'

var adapterNames = fs.readdirSync(PATHadapterS).map(function (c) {
  return c.slice(0, -3)
})

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

  self.options = _.merge(_.cloneDeep(DEFAULT_OPTIONS), options)
  self.adapter = null

  // Handle the adapters
  if (self.options.settings.adapter) {
    self.adapter = self.getAdapter(self.options.settings.adapter)
  }

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
        cb(null, query.sort ? util.sortCheck(query.sort) : self.options.query.sort)
      },
      limit: function (cb) {
        cb(null, query.limit ? util.limitCheck(query.limit, self.options.query.limit) : self.options.query.limit)
      },
      select: function (cb) {
        cb(null, query.select ? util.selectCheck(query.select, self.schema) : self.options.query.select)
      }
    }
  }
}

Build.prototype.getAdapter = function (name) {
  if (typeof name === 'string') {
    if (_.includes(adapterNames, name)) {
      return require(Path.join(PATHadapterS, name))
    }
    throw new Error('Adapter "' + name + '" does not exist. Provide an object to use a custom adapter.')
  }
  return name
}

Build.prototype.config = function (data) {
  var self = this
  if (data) {
    self.options = _.merge(self.options, data)
    self.schema = self.options.settings.schema ? _.uniq(self.options.settings.schema) : []
    self.schemaSort = []
    _.forEach(self.schema, function (key) {
      self.schemaSort.push(key, '-' + key)
    })
  }
  return self.options
}

Build.prototype.parse = function (parse, cb) {
  var options = this.options
  var defaults = _.cloneDeep(this.options.query)

  _.merge(defaults, this.adapter.options)

  var self = this
  if (_.isEmpty(parse)) {
    if (cb) return cb(defaults)
    return defaults
  }
  parse = autoParse(parse)

  var tasks = self.tasks(parse)

  _.merge(tasks, self.adapter(parse))

  var response = autoSync(
    tasks
    , function (err, result) {
      if (err) console.log(err)
      if (typeof self.adapter.afterParse === 'function') {
        self.adapter.afterParse.call(self, result, options)
      }
      return _.merge(defaults, result)
    })
  if (cb) {
    return cb(response)
  } else {
    return response
  }
}

Build.prototype.middleware = function () {
  var self = this
  return function (req, res, next) {
    req.queryParameters = self.parse(req.query)
    next()
  }
}

function build (options) {
  if (options === undefined || (typeof options === 'object' && options !== null)) {
    return new Build(options)
  }

  throw new TypeError('Expected object for argument options but got ' + options)
}

module.exports = build
