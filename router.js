var _  = require('lodash')
  , Route = require('./route');

exports = module.exports = Router

function Router(options) {
	this.map = {};
	this.options = options;
}

Router.prototype.register = function() {
	var identifier = arguments[0]
	  , callbacks = _.flatten([].slice.call(arguments, 1));

	//ensure identifier was given
	if (!identifier) throw new Error('You must supply an identifier to app.on');

	//ensure all callbacks are functions
	_.each(callbacks, function(fn) {
		if ('function' == typeof fn) return;
		var type = {}.toString.call(fn);
		throw new Error('app.on requires callback functions but got a ' + type);
	});

	var route = new Route(identifier, callbacks);

	(this.map[identifier] = this.map[identifier] || []).push(route);
	return this;
}

Router.prototype._dispatch = function(buffer, requestInfo){
    var hex = buffer.toString('hex');
    var opcode = hex.substring(0,4);

    if (this.options.verbose) {
    	console.log('Recieved ' + hex + ' from ' + requestInfo.addrss + ':' + requestInfo.port);
    }

    if (!this.map.opcode) {
    	console.log('No route matched for ' + hex + '. Ignoring packet.');
    	return;
    }

    var req = {};
    var res = {};

    _.each(this.map.opcode, function(route) {
    	var i = 1;

    	route.callbacks[0].call(route, req, res, function() {
    		if (!route.callbacks[i]) return;

    		route.callbacks[i++].call(this, req, res, next);
    	});

    });
}

var decrypt = function(hex, crcSeed) {

    crcSeed = parseInt(crcSeed, 16); //get int of hex for bitwise operations
    data = hex.substring(4).substring(0, hex.length - 8); //ignore opcode and crc
    var length = data.length;

    var response = '', newHexValue, index, prevIndex;

    var block_count = Math.floor(length / 8);
    var byte_count = (length % 8 / 2); //divided by 2 since each hex number is 2 numbers

    // for(var i =0; i < length; i+=8) {
    //     prevIndex = i - 8;

    //     crcSeed = prevIndex < 0 ? crcSeed : parseInt(data.substring(prevIndex, prevIndex+8), 16);
    //     newHexValue = ((parseInt(data.substring(index, index+8), 16) ^ crcSeed)>>>0).toString(16); //>>>0 turns it into an unsigned int
    //     while (newHexValue.length < 8) {
    //         newHexValue = '0' + newHexValue;
    //     }
    //     response += newHexValue;
    // }

    for(var i = 0; i < block_count; i++) {
        index = i*8;
        prevIndex = (i-1)*8;

        if(i > 0) {
            crcSeed = parseInt(data.substring(prevIndex, prevIndex+8), 16);
        }

        newHexValue = ((parseInt(data.substring(index, index+8), 16) ^ crcSeed)>>>0).toString(16); //>>>0 turns it into an unsigned int
        while (newHexValue.length < 8) {
            newHexValue = '0' + newHexValue;
        }
        response += newHexValue;
    }

    crcSeed = parseInt(data.substring(data.length - byte_count*2 - 8, data.length - byte_count*2 - 6), 16); //get the first byte from the key
    for(var j = 0; j < byte_count; j++) {
        index = i*8+(j*2);

        newHexValue = ((parseInt(data.substring(index, index+2), 16) ^ crcSeed)>>>0).toString(16);
        if (newHexValue.length != 2) {
            newHexValue = '0' + newHexValue;
        }
        response += newHexValue;
    }

    response = hex.substring(0,4) + response + hex.substring(hex.length - 4);
    return response.toUpperCase();
};

var encrypt = function(hex, crcSeed) {

    crcSeed = parseInt(crcSeed, 16); //get int of hex for bitwise operations
    data = hex.substring(4).substring(0, hex.length - 8); //ignore opcode and crc
    var length = data.length;

    var response = '', newHexValue, index, prevIndex;

    var block_count = Math.floor(length / 8);
    var byte_count = (length % 8 / 2); //divided by 2 since each hex number is 2 numbers

    for(var i = 0; i < block_count; i++) {
        index = i*8;

        crcSeed = (parseInt(data.substring(index, index+8), 16) ^ crcSeed)>>>0; //>>>0 turns it into an unsigned int
        newHexValue =  crcSeed.toString(16);
        while (newHexValue.length < 8) {
            newHexValue = '0' + newHexValue;
        }
        response += newHexValue;
    }

    crcSeed = parseInt(crcSeed.toString(16).substring(0,2), 16); //get the first byte from the key
    for(var j = 0; j < byte_count; j++) {
        index = i*8+(j*2);

        newHexValue= ((parseInt(data.substring(index, index+2), 16) ^ crcSeed)>>>0).toString(16);
        if (newHexValue.length != 2) {
            newHexValue = '0' + newHexValue;
        }
        response += newHexValue;
    }

    response = hex.substring(0,4) + response + hex.substring(hex.length - 4);
    return response.toUpperCase();
};