# koa-liveload

A liveload middleware for [koa](https://github.com/koajs/koa).

This middleware will inject a script tag for [tiny-lr]() communication into html response, and watch the resource files,
when any resource file get changed the browser will be notified to reload, css file changes would not cause a page refresh.

**note**, this middleware is disabled on `test` nad `production` environment.

Added folder and file will be watched for changes automatically.

## Install

    $ npm install koa-liveload

## Example

``` js
var koa = require('koa');
var liveload = require('koa-liveload');
var koa_static = require('koa-static');

var app = koa();
app.use(liveload(__dirname, {
  includes: ['jade'],
  excludes: ['components']
}))
app.use(koa_static(__driname));

app.listen(3000);
```

## API

``` js
function liveload(directory, [options]);
```

### Options

* `port` port for tiny-lr server [35927]
* `ignoreHidden` ignore dot files [true]
* `includes` include file extensions other than js, css, html
* `excludes` exclude folder names other than node_modules

## License

MIT
