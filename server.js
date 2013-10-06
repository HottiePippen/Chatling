var express = require('express')
var app = express()
var http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);

var jade = require('jade');
var pseudoArray = ['admin']; //block the admin username (you can disable it)

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set("view options", { layout: false })
app.set('port', process.env.PORT || 8081);

var userCount = 0;

app.configure(function() {
	app.use(express.static(__dirname + '/public'));
});

app.get('/', function(req, res){
  res.render('home.jade');
});

server.listen(app.get('port'));

io.sockets.on('connection', function (socket) {
	userCount++;
	reloadUsers();
	socket.on('setPseudo', function (data) {
		socket.set('pseudo', data);
	});
	
	socket.on('message', function (message) {
		socket.get('pseudo', function (error, name) {
		var data = { 'message' : message, pseudo : name };
		socket.broadcast.emit('message', data);
		console.log("user " + name + " send this : " + message);
		})
	});
	
	socket.on('disconnect', function (disconnect){
		userCount--;
		reloadUsers();
	});
});

function reloadUsers() { // Send the count of the users to all
	io.sockets.emit('nbUsers', {"nb": userCount});
}