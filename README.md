
# Express Query Parameters

## NOT READY FOR USE YET

## What is Express Query Parameters
This packaged is used to parse general queries to your express routes. We are adding extra support for sql & mongoose. By using this package as middleware `app.user(query())` you will be able to have all parsed parameters waiting for you at `req.queryParameters` to do and search as you please. Currently we only have the core searches implemented currently in 0.1.0


## Usage
``` js
var qp = require('express-query-parameters') //qp = query-parameters
app.use(qp.query(options))
// Or
var parseData = qp.parse(options)
```

## Documentation

### Filter
```
https://meanstackjs.com/api/blog?name=green
```
##### Usage
``` js
Blog.find(req.queryParameters.filter || '') //Rest of query
```

### Sort
```
https://meanstackjs.com/api/blog?sort=name
```
##### Usage
``` js
Blog.sort(req.queryParameters.sort || '') //Rest of query
```

### Limit
```
https://meanstackjs.com/api/blog?name=green
```
##### Usage
``` js
Blog.limit(req.queryParameters.limit || '') //Rest of query
```

### Skip
```
https://meanstackjs.com/api/blog?name=green
```
##### Usage
``` js
Blog.skip(req.queryParameters.skip || '') //Rest of query
```

### Select
```
https://meanstackjs.com/api/blog?name=green
```
##### Usage
``` js
Blog.select(req.queryParameters.select || '') //Rest of query
```

## Mongoose

Only Supporting One Function

### Lean
```
https://meanstackjs.com/api/blog?lean=true
```
##### Usage
``` js
Blog.lean(req.queryParameters.lean || '') //Rest of query
```

## SQL

No Support Yet

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

#### This is [on GitHub](https://github.com/greenpioneersolutions/auto-parse)
#### Find us [on GitHub](https://github.com/greenpioneersolutions)
#### Find us [on Twitter](https://twitter.com/greenpioneerdev)
#### Find us [on Facebook](https://www.facebook.com/Green-Pioneer-Solutions-1023752974341910)
#### Find us [on The Web](http://greenpioneersolutions.com/)




