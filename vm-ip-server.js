var http = require('http');

var server = http.createServer(function(req, res) {
	var ip = (req.connection && req.connection.remoteAddress) ||
	(req.socket && req.socket.remoteAddress) ||
	(req.connection && req.connection.socket && req.connection.socket.remoteAddress);

	console.log(ip);
	res.end("your ip:" + ip.toString());
});

server.listen(3005, function(){
	console.log('server listening on', 3005);
});