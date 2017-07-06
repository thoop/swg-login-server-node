//login.swgemu.com

var dgram = require('dgram');
var server = dgram.createSocket('udp4');
var swgEmuAddress = '192.168.0.105';
var swgEmuPort = 44453;
var clientAddress = '';
var clientPort = 0;
var SorC = 'C';

server.on('message', function(buffer, requestInfo) {
	if(!clientAddress) {
		clientAddress = requestInfo.address;
		clientPort = requestInfo.port;
		console.log('clientAddress:', clientAddress + ':' + requestInfo.port);
	} else if (clientAddress && clientAddress != requestInfo.address && swgEmuAddress == 'login.swgemu.com') {
		swgEmuAddress = requestInfo.address;
		swgEmuPort = requestInfo.port;
		console.log('swgEmuAddress:', swgEmuAddress + ':' + requestInfo.port);
	}

	var address = clientAddress;
	var port = clientPort;
	SorC = 'S->C';
	if(requestInfo.address == clientAddress) {
		address = swgEmuAddress;
		port = swgEmuPort;
		SorC = 'C->S';
	}

	console.log(SorC, buffer.toString('hex'));
	server.send(buffer, 0, buffer.length, port, address);
});

var listen = function(port, callback) {
	server.on('listening', callback);
	server.bind(port);
};

listen(44453, function() {
	console.log('started passthrough server on 44453');
});