var fs = require('fs');
var app = require('http').createServer(function(req, res){
	// どんなファイルに対してもtext/htmlはまずい気がする
	res.writeHead('Content-Type', 'text/html');
	// urlに応じてファイルを読み込んむ
	try{
		var file = fs.readFileSync(__dirname + req.url);
	} catch(e){
		console.log(req.url + "file not found");
		res.end("404 not found");
		return;
	}
	res.write(file);
	res.end();
}).listen(3000);
var io = require('socket.io').listen(app);

// socket.ioで送受信する
io.sockets.on('connection', function(socket){
	// 送信された時
	socket.on('submit', function(talk){
		console.log(talk);
		// talkの投稿時間を記録して、emit
		talk.time = new Date();
		io.sockets.emit('new_talk', talk);
	});

	// 書き途中の時
	socket.on('writing', function(talk){
		console.log("w", talk);
		// talkの投稿時間を記録して、emit
		talk.time = new Date();
		io.sockets.emit('draft', talk);
	});
});