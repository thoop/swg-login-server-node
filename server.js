var swg = require('swg')

var app = swg({
    verbose: true
});

//Session request
app.on('0001', function(req, res, next) {
    var crcLength = req.hex.substring(4,12);
    var connectionId = req.hex.substring(12,20);
    var clientUDPSize = req.hex.substring(20,28);

    var crcSeed = '00000000';
    var crcLength = '02';
    var useCompression = '00';
    var seedSize = '04';

    res.send('0002' + connectionId + crcSeed + crcLength + useCompression + seedSize + clientUDPSize);
});

//disconnect
app.on('0005', function(req, res, next) {
    console.log(req.requestInfo.address + ' disconnected');
});

//Client network stats update
app.on('0007', function(req, res, next) {
    res.send('0000000000000000000000000000000000000000000000000000000000000000000000000000');
});

//Channel 0 - data packet
app.on('0009', function(req, res, next) {

});


app.listen(44453, function() {
    console.log('server listening ' + app.server.address().address + ':' + app.server.address().port);
});