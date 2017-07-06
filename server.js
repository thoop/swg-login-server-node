var swg = require('swg')

var app = swg({
    verbose: true
});

/*
C->S 00010000000258b026ca000001f0
S->C 000258b026ca28ffa004020104000001f0
C->S 00077c3c6c481efc61286c70612c7f707f2dcc1d
S->C 00081ca2ff281ca2ff281ca2ff281ca2ff281ca2ff281ca2ff281ca2ff281ca2ff281ca2ff281c1c1c0000
C->S 000904a0fb2892bfe86994bf9c01fbd0ec32f1d09f5c9ea7fd33ffd59902f1d5ab32c1e09b06f1d8b637c9e28607c98fed
S->C 00150404046129
S->C 000904a0ff3125a4fff7b31655ffb31655638d478e57a7458ecaa17c9fcca108f7a3ce78c4a3ce78f5a1cec196bd0fc396bd0fc196bd0fc696e94cebd8863a8a5809c5755b09c575530987142060eb7d530b6bf2acf463f2acf407f1ac42a9c79840a9c79842a9c7984da9f6a17587c49440a9f5a57287c49740286939ed4c6939edfe6539edf66539ed76eac61274eac61274e9c61274e4c62744caff106afbc92044cafb12eb6755bf8f6755bf3d6b55bf356b55bfb5e4aa40b7e4aa40b7dea840c39b4225c29b4225ce9b4225899b2325fb9b4f25949b6f25c09b0025a49b6125ca9b0e251fca002336cbf66436cbf76435cbf76434cbf76434aac7
C->S 00150404046129
C->S 00077c3cf4461efcf91ebfc8f21ea0bbf2c1a10f2e
S->C 00085722ff285722ff285722ff285722ff285722ff285722ff285722ff285722ff285722ff285757570000
C->S 00055c10d9e25c5a5c2cf0
*/
var crcSeed = 747506451;//'2c8e0b13';
app.setDefault('crcSeed', crcSeed);

app.on('SOE_SESSION_REQUEST', function(req, res, next) {
    var crcLength = '02';
    var useCompression = '01';
    var seedSize = '04';

    app.setDefault('crcLength', parseInt(crcLength, 16));
    app.setDefault('useCompression', !!parseInt(useCompression, 16));
    app.setDefault('seedSize', parseInt(seedSize, 16));

		res.sendPacket({
			name: 'SOE_SESSION_REPLY',
			connectionId: req.packet.connectionId,
			crcSeed: crcSeed,
			crcLength: crcLength,
			useCompression: useCompression,
			seedSize: seedSize,
			serverUDPSize: req.packet.clientUDPSize
		});
});

app.on('SOE_DISCONNECT', function(req, res, next) {
    console.log(req.requestInfo.address + ' disconnected');
});

app.on('SOE_NET_STATUS_REQ', function(req, res, next) {
    // res.sendRaw('00080000000000000000000000000000000000000000000000000000000000000000000000000000');
		res.sendPacket({
			name: 'SOE_NET_STATUS_RES',
			clientTickCount: 0,
			serverTickCount: 0,
			clientPacketsSent: 0,
			clientPacketsReceived: 0,
			serverPacketsSent: 0,
			serverPacketsReceived: 0
		});
});

app.on('LoginClientId', function(req, res, next) {
		res.sendPacket({
			name: 'LoginClientToken',
			sessionKey: '20000000150000000ed693ded2efbf8ea1acd2ee4c55be305fbe230db4ab58f962697967e8106ed3869b3a4a1a72a1fa8f96ff9fa5625a2901000000',
			userId: 0,
			userName: req.packet.username
		});

		res.sendPacket([
			{
				name: 'LoginEnumCluster',
				ServerCount: 1,
				servers: [
					{
						ServerID: 'abc',
						ServerName: 'Wanderhome',
						Distance: 1
					}
				],
				MaxCharsPerAccount: 2
			},
			{
				name: 'LoginClusterStatus',
				ServerCount: 1,
				servers: [
					{
						ServerID: 'abc',
						IP_ADDR: '127.0.0.1',
						ServerPort: 5000,
						PingPort: 5001,
						ServerPopulation: 100
						MaxCapacity: 200,
						MaxCharsPerServer: 2,
						Distance: 1,
						Status: 1,
						NotRecommendedFlag: false
					}
				]
			}
		]);

		res.sendPacket({
			name: 'EnumerateCharacterId',
			CharacterCount: 1,
			characters: [
					{
						NameString: 'Han Solo',
						RaceGenderCRC: 'abc',
						CharacterID: 123,
						ServerID: 'abc',
						Status: 1
					}
				]
		});
});


app.listen(44453, function() {
    console.log('server listening ' + app.server.address().address + ':' + app.server.address().port);
});