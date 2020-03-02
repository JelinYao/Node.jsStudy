/*****************************
 * Node.js学习代码
 * 测试websocket连接，心跳消息
 * socket.io官网：https://socket.io/
 * github: https://github.com/JelinYao/Node.jsStudy
 * 测试方法：运行本地server.js后，浏览器中输入 http://localhost，点击“创建连接”按钮即可开启websocket心跳
 */


var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);


server.listen(80);
var client_count = 0;

//请求主页，返回index.html页面
app.get('/', function(req, res){
    res.sendfile(__dirname + '/index.html');
});

app.get('/client.js', function(req, res){
    res.sendfile(__dirname + '/client.js');
});

app.get('/index.css', function(req, res){
    res.sendfile(__dirname + '/index.css');
});

//SocketIO.Socket
io.on('connection', socket=>{
    client_count++;
    //接收到客户端的连接
    console.log("client connected: ", socket.id);
    console.log('current client count: ', client_count);
    //接收到客户端的心跳
    socket.on('ping', data=>{
        console.log("recv from client, msg: ", JSON.stringify(data));
        //发送消息，回复客户端心跳
        socket.emit('pong', 'ok');
    });
    //客户端下线
    socket.on('disconnect', data=>{
        client_count--;
        console.log("client disconnected: ", socket.id);
        console.log('current client count: ', client_count);
    })
})
