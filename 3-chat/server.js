/*****************************
 * Node.js学习代码
 * 测试socket.io聊天室
 * socket.io官网：https://socket.io/
 * github: https://github.com/JelinYao/Node.jsStudy

 */


var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

//监听本地端口
server.listen(80);

//返回主页地址
app.get('/', (req, res)=>{
    res.sendFile(__dirname + '/index.html');
})

app.get('/client.js', (req, res)=>{
    res.sendFile(__dirname + '/client.js');
})

app.get('/index.css', (req, res)=>{
    res.sendFile(__dirname + '/index.css');
})

//SocketIO.Socket
io.on('connection', socket=>{

    //客户端上线，通知所有其他客户端
    broadcastMsg(socket, {
        msg_type:'connection',
        socket_id:socket.id,
    });

    //客户端发送聊天消息，广播到其他客户端
    socket.on('chat', data=>{
        broadcastMsg(socket, data);
    });

    //客户端下线
    socket.on('disconnect', data=>{
        //广播到当前域空间下所有连接的socket
        var msg = '客户端[' + socket.id + ']: 下线';
        io.emit('broadcast', msg);
    });
});

function broadcastMsg(socket, data){
    /**
     * Sets the 'broadcast' flag when emitting an event. Broadcasting an event
     * will send it to all the other sockets in the namespace except for yourself
     * 广播到当前域空间下除了自己的所有连接的socket
     */
    socket.broadcast.emit('chat', data);
}