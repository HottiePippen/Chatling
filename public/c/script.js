var socket = io.connect();

function addMessage(msg, pseudo) {
   $("#chatEntries").append('<div class="message"><p>' + pseudo + ' : ' + msg + '</p></div>');
}

function sentMessage() {
   if ($('#messageInput').val() != "") 
   {
      socket.emit('message', $('#messageInput').val());
      addMessage($('#messageInput').val(), "Me", new Date().toISOString(), true);
      $('#messageInput').val('');
   }
}

socket.on('message', function(data) {
   addMessage(data['message'], data['pseudo']);
});

socket.on('nbUsers', function(msg) {
	$("#nbUsers").html(msg.nb);
	console.info('User count ' + msg.nb + ' received');
});

$(function() {
   $("#submit").click(function() {sentMessage();});
   socket.emit('subscribe', {room : chatId});
});