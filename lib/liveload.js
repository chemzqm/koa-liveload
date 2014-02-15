var watchDir = require('./watch');
var tinylr = require('tiny-lr');
var growl = require('growl');
var path = require('path');
var Stream = require('stream');
var PassThrough = require('stream').PassThrough;
var env = process.env.NODE_ENV || 'development';

function getSnippet (port) {
  /*jshint quotmark:false */
  var snippet = [
      "<!-- livereload snippet -->",
      "<script>document.write('<script src=\"http://'",
      " + (location.host || 'localhost').split(':')[0]",
      " + ':" + port + "/livereload.js?snipver=1\"><\\/script>')",
      "</script>",
      ""
      ].join('\n');
  return snippet;
}

/**
 * 
 * @param {String} root root directory for watching required
 * @param {Object} opts optional options
 * @api public
 */
module.exports = function (root, opts) {
  if (env !== 'development') {
    return function* (next) {
      yield next;
    }
  }
  opts = opts || {};
  var port = opts.port || 35729;
  opts.includes = (opts.includes || []).concat(['js', 'css', 'html']);
  opts.excludes = (opts.excludes || []).concat(['node_modules']);
  var snippet = getSnippet(port);
  //setup the server
  var server = new tinylr();
  server.listen(port, function(err) {
    if (err) { throw err; }
    console.log('... Starting Livereload server on ' + port);
  })
  watchDir(root, opts, function (file) {
    //send notification
    var basename = path.basename(file);
    growl('Change file: ' + basename + '. Reloading...', { image: 'Safari', title: 'liveload' });
    server.changed({
      body: { files: file }
    })
  })
  return function *liveload(next) {
    yield *next;
    var type = this.response.get('Content-Type');
    var body = this.body;
    if (!body || !/text\/html/.test(type)) return;
    var len = parseInt(this.response.get('Content-Length'), 10);
    //replace body
    if (typeof body === 'string') {
      this.body = body.replace(/<\/body>/, function (w) {
        if (len) { this.set('Content-Length', len + Buffer.byteLength(snippet)); }
        return snippet + w;
      }.bind(this));
    } else if (body instanceof Stream) {
      var stream = this.body = new PassThrough();
      body.setEncoding('utf8');
      if (len) { this.set('Content-Length', len + Buffer.byteLength(snippet)); }
      body.on('data', function (chunk) {
        chunk = chunk.replace(/<\/body>/, function (w) {
          return snippet + w;
        });
        stream.write(chunk);
      });
      body.on('end', function () {
        stream.end();
      })
      body.on('error', this.onerror);
    }
  }
}
