var build = require('..')({
  settings: {
    schema: ['name', 'title', 'content', 'roles'],
    adapter: 'mongoose'
  // adapter: <object|string:supported adapter>
  //             ^
  //             |
  //             object|string:supported adapter
  }
})

var assert = require('chai').assert
var _ = require('lodash')
describe('Express Query Parameters', function () {
  describe('General', function () {
    it('Config', function () {
      var config = build.config()
      var defaults = _.cloneDeep(config.query)
      _.merge(defaults, build.adapter.options)
      assert.deepEqual(build.parse(), defaults)
    })
    it('Filter', function () {
      assert.deepEqual(build.parse({name: 'jason'}).filter, {
        name: 'jason'
      })
    })
    it('Lean', function () {
      assert.equal(build.parse({lean: 'true'}).lean, true)
      assert.equal(build.parse({lean: true}).lean, true)
    })
    it('Skip', function () {
      assert.equal(build.parse({skip: '4'}).skip, 4)
      assert.equal(build.parse({skip: 4}).skip, 4)
    })
    it('Sort', function () {
      assert.equal(build.parse({sort: 'name'}).sort, 'name')
    })
    it('Limit', function () {
      assert.equal(build.parse({limit: '2'}).limit, 2)
      assert.equal(build.parse({limit: 2}).limit, 2)
    })
    it('Select', function () {
      assert.deepEqual(build.parse({select: 'name'}).select, { name: 1 })
      assert.deepEqual(build.parse({select: 'name title'}).select, { name: 1, title: 1 })
    })
  })
  describe('Mongoose - Parse', function () {
    it('gt', function () {
      assert.equal(build.parse({where: 'name', gt: '2016-10-20'}).gt, '2016-10-20')
    // assert.equal(build.parse({where: 'name', gt: '2016-10-20'}).where, 'name')
    })
    it('lt', function () {
      assert.equal(build.parse({where: 'name', lt: '2016-10-20'}).lt, '2016-10-20')
    // assert.equal(build.parse({where: 'name', lt: '2016-10-20'}).where, 'name')
    })
    it('gte', function () {
      assert.equal(build.parse({where: 'name', gte: '2016-10-20'}).gte, '2016-10-20')
    // assert.equal(build.parse({where: 'name', gte: '2016-10-20'}).where, 'name')
    })
    it('lte', function () {
      assert.equal(build.parse({where: 'name', lte: '2016-10-20'}).lte, '2016-10-20')
    // assert.equal(build.parse({where: 'name', lte: '2016-10-20'}).where, 'name')
    })
    it('in', function () {
      assert.equal(build.parse({where: 'roles', in: 'admin'}).in, 'admin')
    // assert.equal(build.parse({where: 'roles', in: 'admin'}).where, 'roles')
    })
    it('ne', function () {
      assert.equal(build.parse({where: 'roles', ne: 'admin'}).ne, 'admin')
    // assert.equal(build.parse({where: 'roles', ne: 'admin'}).where, 'roles')
    })
    it('nin', function () {
      assert.equal(build.parse({where: 'roles', nin: 'admin'}).nin, 'admin')
    // assert.equal(build.parse({where: 'roles', nin: 'admin'}).where, 'roles')
    })
    it('regex', function () {
      assert.equal(build.parse({where: 'name', regex: 'ja'}).regex, 'ja')
    // assert.equal(build.parse({where: 'name', regex: 'ja'}).where, 'name')
    })
    it('options', function () {
      assert.equal(build.parse({where: 'name', options: '2016-10-20'}).options, '2016-10-20')
    // assert.equal(build.parse({where: 'name', options: '2016-10-20'}).where, 'name')
    })
    it('size', function () {
      assert.equal(build.parse({where: 'roles', size: '3'}).size, '3')
    // assert.equal(build.parse({where: 'roles', size: '3'}).where, 'roles')
    })
    it('all', function () {
      assert.equal(build.parse({where: 'name', all: '2016-10-20'}).all, '2016-10-20')
    // assert.equal(build.parse({where: 'name', all: '2016-10-20'}).where, 'name')
    })
    it('or', function () {
      assert.deepEqual(build.parse({or: {roles: ['admin', 'help']}}).or, { '$or': [ { roles: 'admin' }, { roles: 'help' } ] })
    })
    it('nor', function () {
      assert.deepEqual(build.parse({nor: {roles: ['admin', 'help']}}).nor, { '$nor': [ { roles: 'admin' }, { roles: 'help' } ] })
    })
    it('and', function () {
      assert.deepEqual(build.parse({and: {roles: ['admin', 'help']}}).and, { '$and': [ { roles: 'admin' }, { roles: 'help' } ] })
    })
    it('aggregate', function () {
      assert.deepEqual(build.parse({aggregate: {roles: ['admin', 'help']}}).aggregate, [{roles: ['admin', 'help']}])
    })
    it('populateId', function () {
      assert.equal(build.parse({populateId: 'name title person'}).populateId, 'name title')
    })
    it('populateItems', function () {
      assert.equal(build.parse({populateItems: 'name role content'}).populateItems, 'name content')
    })
    it('deepPopulate', function () {
      assert.equal(build.parse({deepPopulate: 'name.test role content.type'}).deepPopulate, 'name.test role content.type')
    })
  })
  describe('Mongoose - Parse - Advanced', function () {
    it('where - gt & lt', function () {
      assert.deepEqual(build.parse({where: 'created', gt: '2015-11-17', lt: '2019-12-30'}).where, { created: { '$gt': '2015-11-17', '$lt': '2019-12-30' } })
    })
  })
  describe('SQL', function () {
    // Nothing yet
  })
})
