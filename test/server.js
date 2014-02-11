var koa = require('koa');
var koa_static = require('koa-static');
var compress = require('koa-compress');
var liveload = require('..');

var app = koa();

app.use(function* (next) {
  yield next;
})
app.use(compress());
app.use(liveload(__dirname));
app.use(koa_static(__dirname));

app.listen(3000);
console.log('server started at 3000');
