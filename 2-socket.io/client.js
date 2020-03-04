
//const io = require('socket.io-client');

var socket = null; 

function onConnect(){
    if(socket != null && socket.connected){
        alert("socket is already connected!");
        return;
    }
    socket = io('http://localhost');
    //接收到服务器返回的消息
    socket.on('pong', data=>{
        console.log('server pong: ', JSON.stringify(data));
        addMessageToHtml('recv messge: pong');
        //开启定时发送
        setTimeout(sendMsg, 100, socket);
    })
    //连接到服务器后，开启定时心跳
    setTimeout(sendMsg, 100, socket);
}

function onStop(){
    if(socket){
        addMessageToHtml('stop client: ' + socket.id);
        socket.close();
        socket = null;
    }
}

function sendMsg(){
    socket.emit('ping', {msg:'client to server msg!'});
    addMessageToHtml('send messge: ping');
}

function addMessageToHtml(msg){
    var liElem = document.createElement('li');
    liElem.innerText = msg;
    var ulElem = document.getElementById('message');
    if(ulElem){
        ulElem.appendChild(liElem);
    }
}