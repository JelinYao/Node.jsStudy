
var socket = null;
//重连次数
var retry_count = 0;
function onInterRoom(){
    if(socket != null && socket.connected){
        alert("socket is already connected!");
        return;
    }
    //这里使用的是我的内网地址，方便在虚拟机、手机上也可以测试
    socket = io('http://192.168.0.108');
    //连接上服务端
    socket.on('connect', ()=>{
        var osInfo = getOsInfo();
        addMsgToHtml('本机-' + osInfo.name + '[' + socket.id + ']: 上线');
        //addMsgToHtml(JSON.stringify(osInfo));
    });
    //聊天
    socket.on('chat', data=>{
        console.log(JSON.stringify(data));
        //群发消息
        var socket_id = data.socket_id;
        var msg = "客户端[" + socket_id + "]: ";
        if(data.msg_type == 'connection'){
            msg += "上线";
        }
        else if(data.msg_type == 'text'){
            msg += data.value;
        }
        addMsgToHtml(msg);
    });

    //广播消息
    socket.on('broadcast', data=>{
        addMsgToHtml(data);
    })
    //重连
    socket.on('reconnect_attempt', ()=>{
        addMsgToHtml('本机[' + socket.id + ']: 尝试重新连接服务器');
    });
}

function onExitRoom(){
    if(socket != null){
        addMsgToHtml('本机[' + socket.id + ']: 下线');
        socket.close();
        socket = null;
    }
}

function addMsgToHtml(msg){
    var liElem = document.createElement('li');
    liElem.innerText = msg;
    var ulElem = document.getElementById('message');
    if(ulElem){
        ulElem.appendChild(liElem);
    } 
}

//点击发送消息按钮
function onSendMsg(){
    if(socket == null || socket.disconnected){
        alert('网络未连接');
        return;
    }
    //获取发送消息内容
    var input = document.getElementById('msg_input');
    var msg = input.value;
    if(msg.length == 0){
        alert('请先输入发送内容');
        return;
    }
    addMsgToHtml('本机[' + socket.id + ']: ' + msg);
    socket.emit('chat', {
        msg_type:'text',
        socket_id:socket.id,
        value:msg,
    });
    input.value = '';
}

function onInputKeydown(event){
    if (event.key == 'Enter'){
        onSendMsg();
    }
}

// 获取操作系统信息 
function getOsInfo() {
    var userAgent = navigator.userAgent.toLowerCase();
    var name = 'Unknown';
    var version = 'Unknown';
    if (userAgent.indexOf('win') > -1) {
        name = 'Windows';
        if (userAgent.indexOf('windows nt 5.0') > -1) {
            version = 'Windows 2000';
        } else if (userAgent.indexOf('windows nt 5.1') > -1 || userAgent.indexOf('windows nt 5.2') > -1) {
            version = 'Windows XP';
        } else if (userAgent.indexOf('windows nt 6.0') > -1) {
            version = 'Windows Vista';
        } else if (userAgent.indexOf('windows nt 6.1') > -1 || userAgent.indexOf('windows 7') > -1) {
            version = 'Windows 7';
        } else if (userAgent.indexOf('windows nt 6.2') > -1 || userAgent.indexOf('windows 8') > -1) {
            version = 'Windows 8';
        } else if (userAgent.indexOf('windows nt 6.3') > -1) {
            version = 'Windows 8.1';
        } else if (userAgent.indexOf('windows nt 6.2') > -1 || userAgent.indexOf('windows nt 10.0') > -1) {
            version = 'Windows 10';
        } else {
            version = 'Unknown';
        }
    } else if (userAgent.indexOf('iphone') > -1) {
        name = 'Iphone';
    } else if (userAgent.indexOf('mac') > -1) {
        name = 'Mac';
    } else if (userAgent.indexOf('x11') > -1 || userAgent.indexOf('unix') > -1 || userAgent.indexOf('sunname') > -1 || userAgent.indexOf('bsd') > -1) {
        name = 'Unix';
    } else if (userAgent.indexOf('linux') > -1) {
        if (userAgent.indexOf('android') > -1) {
            name = 'Android';
        } else {
            name = 'Linux';
        }
    } else {
        name = 'Unknown';
    }
    return { name, version };
}