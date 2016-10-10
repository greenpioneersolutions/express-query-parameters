;(function () {
  'use strict'
  var _ = require('lodash')
  var chalk = require('chalk')
  var auto = require('run-auto')
  var autoParse = require('auto-parse')
  var functions = {
    options: require('./lib/options'),
    query: require('./lib/query')
  }

  function Build (options) {
    if (options) {
      this.options = _.merge(functions.options, options)
    } else {
      this.options = functions.options
    }
  }
  Build.prototype.config = function (data) {
    if (data) {
      this.options = _.merge(this.options, data)
    }
  }
  Build.prototype.query = function (params) {
    var defaults = this.options.query
    var schema = params.schema || []
    var schemaSort = []
    schema = _.uniq(schema)
    _.forEach(schema, function (key) {
      schemaSort.push(key)
      schemaSort.push('-' + key)
    })
    return function (res, req, next) {
      var query = req.query || {}
      var queryParameters = {}
      queryParameters.error = {}
      queryParameters.warning = {}
      queryParameters.filter = {}
      if (_.isEmpty(req.query)) {
        req.queryParameters = defaults
        return next()
      }

      auto({
        filter: function (cb) {
          _.forEach(query, function (a, keys) {
            if (schema.indexOf(keys) !== -1) {
              queryParameters.filter[keys] = autoParse(a)
            }
          })
          cb(null, queryParameters.filter)
        },
        lean: function (cb) {
          cb(null, query.lean || defaults.lean)
        },
        skip: function (cb) {
          cb(null, parseInt(query.skip, 10) || defaults.skip)
        },
        sort: function (cb) {
          cb(null, query.sort ? sortCheck(query.sort) : defaults.sort)
        },
        limit: function (cb) {
          cb(null, query.limit ? limitCheck(query.limit) : defaults.limit)
        },
        select: function (cb) {
          cb(null, query.select ? selectCheck(query.select) : defaults.select)
        }
      }, function (err, result) {
        if (err)console.log(err)
        req.queryParameters = _.merge(result, queryParameters)
        return next()
      })

      function sortCheck (sort) {
        return sort
      }

      function limitCheck (number) {
        return parseInt(number, 10)
      }
      function selectCheck (select) {
        if (_.isArray(query.select)) {
          var selected = ''
          _.forEach(query.select, function (n, key) {
            if (schema.indexOf(n) !== -1) {
              selected += n + ' '
            } else {
              selected += n + ' '
            }
          })
          return selected
        } else {
          return schema.indexOf(select) !== -1 ? select : errorHandler(query.select, 'select', defaults.select)
        }
      }
      function errorHandler (errValue, field, value) { // ERRORHANDLER
        if (!queryParameters.error[field]) queryParameters.error[field] = []
        queryParameters.error[field].push({
          message: defaults.errorMessage,
          value: errValue
        })
        return value
      }
    } // END OF RETURN
  } // END OF QUERY

  function build (options) {
    if (options === undefined) {
      return new Build()
    }

    if (typeof options === 'object' && options !== null) {
      return new Build(options)
    }
    throw new TypeError(chalk.red('Expected object for argument options but got ' + chalk.red.underline.bold(options)))
  }
  module.exports = build
})()
