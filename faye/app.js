var http = require('http');
var faye = require('faye');

var server = http.createServer(function(request,response){
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.end('Nothing to see here :)');
}),
    bayeux = new faye.NodeAdapter({mount: '/', timeout: 45});
bayeux.attach(server);
server.listen(8080);
