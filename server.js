var swg = require('swg')

var app = swg({
    verbose: true
});

app.shouldAcknowledgePackets = true;

//Session request
app.on('0001', function(req, res, next) {
    var crcLength = '02';
    var useCompression = '01';
    var seedSize = '04';

    app.crcLength = parseInt(crcLength, 16);
    app.useCompression = parseInt(useCompression, 16);
    app.seedSize = parseInt(seedSize, 16);

    res.send('0002' + req.packet.connectionId + req.packet.crcSeed + crcLength + useCompression + seedSize + req.packet.clientUDPSize);
});

//disconnect
app.on('0005', function(req, res, next) {
    console.log(req.requestInfo.address + ' disconnected');
});

//Client network stats update
app.on('0007', function(req, res, next) {
    res.send('00080000000000000000000000000000000000000000000000000000000000000000000000000000');
});

app.on('0009', function() {
    console.log('0009');
});

app.on('41131F96', function(req, res, next) {
    console.log(req.packet);
    var operandCount = '0400';
    var opcode = 'C696B2AA';
    var sessionKeySize = '3C000000';
    var sessionKey = '20000000150000000ED693DED2EFBF8EA1ACD2EE4C55BE305FBE230DB4AB58F962697967E8106ED3869B3A4A1A72A1FA8F96FF9FA5625A2911000000';
    var userId = '0000000000';
    var stringSize = '0500';
    var username = '74686F6F70';
    res.send('0009' + operandCount + opcode + sessionKeySize + sessionKey + userId + stringSize + username);
});


app.listen(44453, function() {
    console.log('server listening ' + app.server.address().address + ':' + app.server.address().port);
});