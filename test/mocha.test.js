var build = require('../index')({settings: {schema: ['name', 'title', 'content'], mongoose: true}})
var options = require('../lib/options.js')
var assert = require('chai').assert
describe('Express Query Parameters', function () {
  it('Empty', function () {
    assert.deepEqual(build.parse(), options.query)
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
