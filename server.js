var express = require('express')
var app = express()
var http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);
var jade = require('jade');

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set("view options", { layout: false })
app.set('port', process.env.PORT || 3000);

var userCount = 0;

app.configure(function() {
	app.use(express.static(__dirname + '/public'));
});

//Mapping to different chat rooms

app.get('/', function(req, res){
  res.render('home.jade');
});

app.get('/c/:id', function(req, res){
	res.render('chat.jade', {id : JSON.stringify(req.params.id)});
});


//Server communication through socket.io

server.listen(app.get('port'));

io.sockets.on('connection', function (socket) {
	userCount++;
	reloadUsers();
	var userRoom = ''
	
	socket.on('setPseudo', function (data) {
		socket.set('pseudo', data);
	});
	
	socket.on('message', function (message) {
		socket.get('pseudo', function (error, name) {
		var data = { 'message' : message, pseudo : name };
		socket.broadcast.to(userRoom).emit('message', data);
		console.log("user" + " send this : " + message + ' to room ' + userRoom);
		})
	});
	
	socket.on('subscribe', function(data) { 
		socket.join(data.room); 
		userRoom = data.room;
		console.log('User joined room ' + data.room)
		})
	
	socket.on('disconnect', function (disconnect){
		userCount--;
		reloadUsers();
	});
});

function reloadUsers() { // Send the count of the users to all
	io.sockets.emit('nbUsers', {"nb": userCount});
}