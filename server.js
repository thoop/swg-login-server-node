var swg = require('./swg')

var app = swg({
    verbose: true
});

app.on('0001', function(req, res, next) {
    console.log('got 0001');
    next();

}, function(req, res, next) {
    console.log('in next');

    var crcLength = req.hex.substring(4,12);
    var connectionId = req.hex.substring(12,20);
    var clientUDPSize = req.hex.substring(20,28);

    var crcSeed = '00000000';
    var crcLength = '02';
    var useCompression = '00';
    var seedSize = '04';

    var response = new Buffer('0002' + connectionId + crcSeed + crcLength + useCompression + seedSize + clientUDPSize, 'hex');

    res.send(response);
});

app.on('0007', function(req, res, next) {
    console.log('got 0007');
    next();
}, function(req, res, next) {

    var response = new Buffer('0000000000000000000000000000000000000000000000000000000000000000000000000000', 'hex');
    res.send(response);
});


app.listen(44453, function() {
    console.log('server listening ' + app.server.address().address + ':' + app.server.address().port);
});