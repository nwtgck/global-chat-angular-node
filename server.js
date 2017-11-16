var fs = require('fs');

var port = 3000;
if(process.argv.length == 3){
	port = parseInt(process.argv[2]);
}

var app = require('http').createServer(function(req, res){
	// どんなファイルに対してもtext/htmlはまずい気がする
	// res.writeHead('Content-Type', 'text/html');
	console.log(req.url);
	// urlに応じてファイルを読み込んむ
	try{
		var filename = (req.url == '/')? '/index.html' : req.url;
		var file = fs.readFileSync(__dirname + filename);
	} catch(e){
		console.log(req.url + "file not found");
		res.end("404 not found");
		return;
	}
	res.write(file);
	res.end();
}).listen(port, function(){
	console.log('Listening on '+port+'...');
});

var io = require('socket.io').listen(app);

// 投稿されているトークを保存（サーバーが動いている間だけ）
var talks = [];

// socket.ioで送受信する
io.sockets.on('connection', function(socket){
	// 初期時に今まで投稿されているトークを送信する
	socket.emit('init', {talks: talks});

	// 送信された時
	socket.on('submit', function(talk){
		console.log(talk);
		// talkの投稿時間を記録して、emit
		talk.time = new Date();
		io.sockets.emit('new_talk', talk);
		// サーバーのtalksに追加する
		talks.push(talk);
	});

	// 書き途中の時
	socket.on('writing', function(talk){
		// talkの投稿時間を記録して、emit
		talk.time = new Date();
		io.sockets.emit('draft', talk);
	});
});

console.log("Server running...");