var dgram = require('dgram');
var server = dgram.createSocket('udp4');

var decrypt = function(hex, crcSeed) {

    crcSeed = parseInt(crcSeed, 16); //get int of hex for bitwise operations
    data = hex.substring(4).substring(0, hex.length - 8); //ignore opcode and crc
    var length = data.length;

    var response = '', newHexValue, temp;

    var block_count = Math.floor(length / 8);
    var byte_count = (length % 8 / 2); //divided by 2 since each hex number is 2 numbers

    for(var i = 0; i < block_count; i++) {
        if(i > 0) {
            crcSeed = parseInt(data.substring((i-1)*8, (i-1)*8+8), 16);
        }
        newHexValue = ((parseInt(data.substring(i*8, i*8+8), 16) ^ crcSeed)>>>0).toString(16); //>>>0 turns it into an unsigned int
        while (newHexValue.length != 8) {
            newHexValue = '0' + newHexValue;
        }
        response += newHexValue;
    }

    crcSeed = parseInt(data.substring(data.length - byte_count*2 - 8, data.length - byte_count*2 - 6), 16); //get the first byte from the key
    for(var j = 0; j < byte_count; j++) {
        newHexValue= ((parseInt(data.substring(i*8+(j*2), i*8+(j*2)+2), 16) ^ crcSeed)>>>0).toString(16);
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

    var response = '', newHexValue;

    var block_count = Math.floor(length / 8);
    var byte_count = (length % 8 / 2); //divided by 2 since each hex number is 2 numbers

    for(var i = 0; i < block_count; i++) {
        crcSeed = (parseInt(data.substring(i*8, i*8+8), 16) ^ crcSeed)>>>0; //>>>0 turns it into an unsigned int
        newHexValue =  crcSeed.toString(16);
        while (newHexValue.length < 8) {
            newHexValue = '0' + newHexValue;
        }
        response += newHexValue;
    }

    crcSeed = parseInt(crcSeed.toString(16).substring(0,2), 16); //get the first byte from the key
    for(var j = 0; j < byte_count; j++) {
        newHexValue= ((parseInt(data.substring(i*8+(j*2), i*8+(j*2)+2), 16) ^ crcSeed)>>>0).toString(16);
        if (newHexValue.length != 2) {
            newHexValue = '0' + newHexValue;
        }
        response += newHexValue;
    }

    response = hex.substring(0,4) + response + hex.substring(hex.length - 4);
    return response.toUpperCase();
};

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