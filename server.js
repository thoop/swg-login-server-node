var dgram = require('dgram');
var server = dgram.createSocket('udp4');

server.on('message', function(buffer, rinfo){
    var hex = buffer.toString('hex');
    var opcode = hex.substring(0,4);

    if (opcode === '0001') {
        console.log('R Session Request:' + hex + ' from ' + rinfo.address + ':' + rinfo.port);

        var crcLength = hex.substring(4,12);
        var connectionId = hex.substring(12,20);
        var clientUDPSize = hex.substring(20,28);

        var crcSeed = '00000000';
        var crcLength = '02';
        var useCompression = '00';
        var seedSize = '04';

        var response = new Buffer('0002' + connectionId + crcSeed + crcLength + useCompression + seedSize + clientUDPSize, 'hex');
        console.log('S Session Response:' + response.toString('hex') + ' to ' + rinfo.address + ':' + rinfo.port);
        server.send(response, 0, response.length, rinfo.port, rinfo.address);

    } else if (opcode === '0005') {
        console.log('R Disconnect:' + hex + ' from ' + rinfo.address + ':' + rinfo.port);

    } else if (opcode === '0007') {
        console.log('R Client Network Status Update:' + hex + ' from ' + rinfo.address + ':' + rinfo.port);

        var response = new Buffer('0000000000000000000000000000000000000000000000000000000000000000000000000000', 'hex');
        console.log('S Server Network Status Update:' + response.toString('hex') + ' to ' + rinfo.address + ':' + rinfo.port);
        server.send(response, 0, response.length, rinfo.port, rinfo.address);

    } else if (opcode === '0009') {
        console.log('R Channel 0 Data:' + hex + ' from ' + rinfo.address + ':' + rinfo.port);

    } else {
        console.log('R UNKNOWN:' + hex + ' from ' + rinfo.address + ':' + rinfo.port);
    }

});

server.on('listening', function(){
    var address = server.address();
    console.log('server listening ' + address.address + ':' + address.port);
});

server.bind(44453);