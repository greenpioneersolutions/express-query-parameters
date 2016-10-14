var express = require('express')
var app = express()
var build = require('..')({
  settings: {
    schema: ['name', 'title', 'content', 'roles', 'email'],
    adapter: 'mongoose'
  // adapter: <object|string:supported adapter>
  //             ^
  //             |
  //             object|string:supported adapter
  }
})
app.use(build.middleware())
app.get('/query', function (req, res, next) {
  res.send(req.queryParameters)
})
app.listen(3000)

var assert = require('chai').assert
var request = require('supertest')
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
    })
    it('lt', function () {
      assert.equal(build.parse({where: 'name', lt: '2016-10-20'}).lt, '2016-10-20')
    })
    it('gte', function () {
      assert.equal(build.parse({where: 'name', gte: '2016-10-20'}).gte, '2016-10-20')
    })
    it('lte', function () {
      assert.equal(build.parse({where: 'name', lte: '2016-10-20'}).lte, '2016-10-20')
    })
    it('in', function () {
      assert.equal(build.parse({where: 'roles', in: 'admin'}).in, 'admin')
    })
    it('ne', function () {
      assert.equal(build.parse({where: 'roles', ne: 'admin'}).ne, 'admin')
    })
    it('nin', function () {
      assert.equal(build.parse({where: 'roles', nin: 'admin'}).nin, 'admin')
    })
    it('regex', function () {
      assert.equal(build.parse({where: 'name', regex: 'ja'}).regex, 'ja')
    })
    it('options', function () {
      assert.equal(build.parse({where: 'name', options: '2016-10-20'}).options, '2016-10-20')
    })
    it('size', function () {
      assert.equal(build.parse({where: 'roles', size: '3'}).size, '3')
    })
    it('all', function () {
      assert.equal(build.parse({where: 'name', all: '2016-10-20'}).all, '2016-10-20')
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
    it('where - gt & lt', function () {
      assert.deepEqual(build.parse({where: 'created', gt: '2015-11-17', lt: '2019-12-30'}).where, { created: { '$gt': '2015-11-17', '$lt': '2019-12-30' } })
    })
  })
  describe('Mongoose - Middleware', function () {
    it('GET /query', function (done) {
      request('localhost:3000/')
        .get('query')
        .expect(200, function (err, res) {
          if (err) return done(err)
          var config = build.config()
          var defaults = _.cloneDeep(config.query)
          _.merge(defaults, build.adapter.options)
          assert.deepEqual(res.body, defaults)
          done()
        })
    })

    it('GET /query?title=Deployment Ready', function (done) {
      request('localhost:3000/')
        .get('query?title=Deployment%20Ready')
        .expect(200, function (err, res) {
          if (err) return done(err)

          assert.equal(res.body.filter.title, 'Deployment Ready')
          done()
        })
    })
    it('GET /query?sort=title', function (done) {
      request('localhost:3000/')
        .get('query?sort=title')
        .expect(200, function (err, res) {
          if (err) return done(err)

          assert.equal(res.body.sort, 'title')
          done()
        })
    })

    it('GET /query?limit=10', function (done) {
      request('localhost:3000/')
        .get('query?limit=10')
        .expect(200, function (err, res) {
          if (err) return done(err)

          assert.equal(res.body.limit, '10')
          done()
        })
    })

    it('GET /query?lean=true', function (done) {
      request('localhost:3000/')
        .get('query?lean=true')
        .expect(200, function (err, res) {
          if (err) return done(err)

          assert.equal(res.body.lean, true)
          done()
        })
    })

    it('GET /query?select=title', function (done) {
      request('localhost:3000/')
        .get('query?select=title')
        .expect(200, function (err, res) {
          if (err) return done(err)

          assert.deepEqual(res.body.select, { title: 1 })
          done()
        })
    })
    it('GET /query?where=title', function (done) {
      request('localhost:3000/')
        .get('query?where=title')
        .expect(200, function (err, res) {
          if (err) return done(err)

          assert.equal(res.body.where, 'title')
          done()
        })
    })
    it('GET /query?where=title&find=Smart', function (done) {
      request('localhost:3000/')
        .get('query?where=title&find=Smart')
        .expect(200, function (err, res) {
          if (err) return done(err)
          assert.equal(res.body.where.title, 'Smart')
          done()
        })
    })

    it('GET /query?where=created&gt=2015-11-17&lt=2019-12-30', function (done) {
      request('localhost:3000/')
        .get('query?where=created&gt=2015-11-17&lt=2019-12-30')
        .expect(200, function (err, res) {
          if (err) return done(err)
          assert.equal(res.body.gt, '2015-11-17')
          assert.equal(res.body.lt, '2019-12-30')

          done()
        })
    })
    it('GET /query?where=title&equals=Development Tools', function (done) {
      request('localhost:3000/')
        .get('query?where=title&equals=Development Tools')
        .expect(200, function (err, res) {
          if (err) return done(err)
          assert.equal(res.body.equals, 'Development Tools')
          assert.equal(res.body.where.title, 'Development Tools')
          done()
        })
    })
    it('GET /query?where=roles&in=development', function (done) {
      request('localhost:3000/')
        .get('query?where=roles&in=development')
        .expect(200, function (err, res) {
          if (err) return done(err)
          assert.equal(res.body.where.roles.$in, 'development')
          done()
        })
    })
    // ne  http://localhost:3000/api/v1/campaigns?where=email&ne=john@greenpioneersolutions.com
    it('GET /query?where=roles&ne=qa', function (done) {
      request('localhost:3000/')
        .get('query?where=roles&ne=qa')
        .expect(200, function (err, res) {
          if (err) return done(err)
          assert.equal(res.body.where.roles.$ne, 'qa')
          done()
        })
    })
    it('GET /query?where=roles&nin=qa', function (done) {
      request('localhost:3000/')
        .get('query?where=roles&nin=qa')
        .expect(200, function (err, res) {
          if (err) return done(err)
          assert.equal(res.body.where.roles.$nin, 'qa')
          done()
        })
    })

    // regex & options http://localhost:3000/api/v1/campaigns?where=email&regex=\/com\/&options=%3Coptions%3E
    it('GET /query?where=email&regex=greenpioneersolution&options=<options>', function (done) {
      request('localhost:3000/')
        .get('query?where=email&regex=greenpioneersolution&options=<options>')
        .expect(200, function (err, res) {
          if (err) return done(err)
          assert.equal(res.body.where.email.$regex, 'greenpioneersolution')
          assert.equal(res.body.where.email.$options, '<options>')
          done()
        })
    })
    // size  http://localhost:3000/api/v1/campaigns?where=emails&size=2
    it('GET /query?where=roles&size=2', function (done) {
      request('localhost:3000/')
        .get('query?where=roles&size=2')
        .expect(200, function (err, res) {
          if (err) return done(err)
          assert.equal(res.body.where.roles.$size, '2')
          done()
        })
    })
    // all http://localhost:3000/api/v1/campaigns?where=email&all=shawn@greenpioneersolutions.com
    it('GET /query?where=roles&all=gps&all=admin', function (done) {
      request('localhost:3000/')
        .get('query?where=roles&all=gps&all=admin')
        .expect(200, function (err, res) {
          if (err) return done(err)
          assert.equal(res.body.where.roles.$all[0], 'gps')
          assert.equal(res.body.where.roles.$all[1], 'admin')
          done()
        })
    })

    // http://localhost:3000/api/v1/Users?or[roles]=gps&or[roles]=admin
    it('GET /query?or[roles]=gps&or[roles]=admin', function (done) {
      request('localhost:3000/')
        .get('query?or[roles]=gps&or[roles]=admin')
        .expect(200, function (err, res) {
          if (err) return done(err)
          assert.equal(res.body.filter.$or[0].roles, 'gps')
          assert.equal(res.body.filter.$or[1].roles, 'admin')
          done()
        })
    })

    // http://localhost:3000/api/v1/Users?and[roles]=gps&and[roles]=admin
    it('GET /query?and[roles]=gps&and[roles]=admin', function (done) {
      request('localhost:3000/')
        .get('query?and[roles]=gps&and[roles]=admin')
        .expect(200, function (err, res) {
          if (err) return done(err)
          assert.equal(res.body.filter.$and[0].roles, 'gps')
          assert.equal(res.body.filter.$and[1].roles, 'admin')
          done()
        })
    })

    // http://localhost:3000/api/v1/Users?nor[roles]=admin&nor[roles]=help
    it('GET /query?nor[roles]=admin&nor[roles]=help', function (done) {
      request('localhost:3000/')
        .get('query?nor[roles]=admin&nor[roles]=help')
        .expect(200, function (err, res) {
          if (err) return done(err)
          assert.equal(res.body.filter.$nor[0].roles, 'admin')
          assert.equal(res.body.filter.$nor[1].roles, 'help')
          done()
        })
    })

    // find  http://localhost:3000/api/v1/Users?where=email&find=jason@
    it('GET /query?where=email&find=jason@', function (done) {
      request('localhost:3000/')
        .get('query?where=email&find=jason@')
        .expect(200, function (err, res) {
          if (err) return done(err)
          assert.equal(res.body.find, 'jason@')
          assert.equal(res.body.where.email, 'jason@')
          done()
        })
    })
    // find  http://localhost:3000/api/v1/Users?where=email&find=@greenpioneersolutions.com
    it('GET /query?where=email&find=@greenpioneersolutions.com', function (done) {
      request('localhost:3000/')
        .get('query?where=email&find=@greenpioneersolutions.com')
        .expect(200, function (err, res) {
          if (err) return done(err)

          assert.equal(res.body.find, '@greenpioneersolutions.com')
          assert.equal(res.body.where.email, '@greenpioneersolutions.com')
          done()
        })
    })

    // http://localhost:3000/api/v1/campaigns/task/aggregate?aggregate[$unwind]=$donations&aggregate[$group][_id]=$_id&aggregate[$group][balance][$sum]=$donations.amount
    it('GET /query/aggregate?aggregate[$group][_id]=$user', function (done) {
      request('localhost:3000/')
        .get('query?aggregate[$group][_id]=$user')
        .expect(200, function (err, res) {
          if (err) return done(err)
          assert.equal(res.body.aggregate[0]['$group']._id, '$user')
          done()
        })
    })
  })
  describe('SQL - parse', function () {
    // Nothing yet
  })
  describe('SQL - middleware', function () {
    // Nothing yet
  })
})
