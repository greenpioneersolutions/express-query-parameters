# Express Query Parameters

[![npm][npm-image]][npm-url]
[![downloads][downloads-image]][downloads-url]
[![dependencies](https://david-dm.org/greenpioneersolutions/express-query-parameters.svg)](https://david-dm.org/greenpioneersolutions/express-query-parameters)
[![npm-issues](https://img.shields.io/github/issues/greenpioneersolutions/express-query-parameters.svg)](https://github.com/greenpioneersolutions/express-query-parameters/issues)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![Build Status](https://travis-ci.org/greenpioneersolutions/express-query-parameters.svg?branch=master)](https://travis-ci.org/greenpioneersolutions/express-query-parameters)
[![js-standard-style](https://nodei.co/npm/express-query-parameters.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/express-query-parameters.png?downloads=true&downloadRank=true&stars=true)

[npm-image]: https://img.shields.io/npm/v/express-query-parameters.svg?style=flat
[npm-url]: https://npmjs.org/package/express-query-parameters
[downloads-image]: https://img.shields.io/npm/dt/express-query-parameters.svg?style=flat
[downloads-url]: https://npmjs.org/package/express-query-parameters


## What is Express Query Parameters
This package is used to parse general queries and any other apdapter you want or create to add to your express routes. By using this package as middleware `app.user(queryParameters.middleware())` you will be able to have all parsed parameters waiting for you at `req.queryParameters` to do and search as you please.


## Usage
``` js
var express = require('express')
var app = express()
var queryParameters = require('express-query-parameters')({
  settings: {
    schema: ['name', 'title', 'content', 'roles', 'email'],
    adapter: 'mongoose' // <object|string:supported adapter(MONGOOSE)>
  }
})
app.use(queryParameters.middleware())
app.get('/query', function (req, res, next) {
  res.send(req.queryParameters)
})
app.listen(3000)
// Or
var parseData = queryParameters.parse(options)
```

## Documentation
* Construct `queryParameters({})` - allows you to set the options
* Config `queryParameters.config({})` - give you a way to get or set the config
* Middleware - `queryParameters.middleware()` - Middlware pulls from `req.query` for query and from the options set in the contruct & config
* Parse - `var data = queryParameters.parse(queryObj)`

### Options
``` js
{
  query: {
    sort: '', // allows you to sort based of the schema
    filter: {}, // allows you to sort based of the schema
    limit: 20, // allows you to set a max limit/default limit
    skip: 0,  // allows you to set a base skip 
    select: '' // allows you to select fields based of the schema 
  },
  settings: {
  	// set your fields you wish to check agains that the user can query on
    schema: ['myFields', 'namesToFilterOn', 'email', 'content', 'ex'] 
  }
}
```
### Adapters

We currently support custom adapters or you can use mongoose our home grown adapter

#### Mongoose

Check the options out below on what you can set as your defaults for the mongoose adapter.

##### Options
``` js
{
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
```
#### SQL

No Support Yet

#### Custom

More docs to come here but we will leave a example

``` js
var OPTIONS = {
  lean:true,
  gt:'test'
}
function MongooseAdapter (query) {
  var self = this

  return {  // NOTE you must return a list of tasks  - follow this https://www.npmjs.com/package/run-auto
    lean: function (cb) {
      cb(null, query.lean || OPTIONS.lean)
    },
    gt: function (cb) {
      cb(null, query.gt || OPTIONS.gt)
    }    
  }
}

MongooseAdapter.afterParse = function (result, options) {
  //if you need to update the result do it right here we have also supplied the entire options
}

MongooseAdapter.options = OPTIONS

module.exports = MongooseAdapter
```

[Credit From Buildreq Query.js](https://www.npmjs.com/package/buildreq)


## License

The MIT License (MIT)

Copyright (c) 2014-2017 Green Pioneer

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

Created by ![Green Pioneer](http://greenpioneersolutions.com/img/icons/apple-icon-180x180.png)

#### This is [on GitHub](https://github.com/greenpioneersolutions/express-query-parameters)
#### Find us [on GitHub](https://github.com/greenpioneersolutions)
#### Find us [on Twitter](https://twitter.com/greenpioneerdev)
#### Find us [on Facebook](https://www.facebook.com/Green-Pioneer-Solutions-1023752974341910)
#### Find us [on The Web](http://greenpioneersolutions.com/)




