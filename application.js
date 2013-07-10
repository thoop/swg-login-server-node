var Router = require('./router')
  , dgram = require('dgram');

var app = exports = module.exports = {};

app.init = function(options) {
	this.options = options;
    this._router = new Router(options);
    this.server = dgram.createSocket('udp4');
    this.server.on('message', this._router._dispatch);
};

app.listen = function(port, callback) {

    this.server.on('listening', callback);

    this.server.bind(44453);
};

app.on = function() {
	this._router.register(arguments);
};