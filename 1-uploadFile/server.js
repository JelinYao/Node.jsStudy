/*****************************
 * Node.js学习代码
 * 测试上传文件
 * github: https://github.com/JelinYao/Node.jsStudy
 */


var https = require('https');
var fs = require('fs');
var express = require('express');
var multiparty = require('multiparty');

//配置HTTPS证书（此证书通过git工具生成的，查看：https://blog.csdn.net/weixin_33701294/article/details/85998586）
var options = {
    key:fs.readFileSync('.\\privatekey.pem'),
    cert:fs.readFileSync('.\\certificate.pem')
};

var app = express();
//监听HTTPS端口443
https.createServer(options, app).listen(443);

app.get('/', function(request, response){
    response.writeHead(301, {'location':'/index.html'});
    response.end();
});

//上传文件
app.get('/index.html', function(request, response){

    fs.readFile('./index.html', function(err, bytes){
        if(err){
            console.log(err);
            response.writeHead(404, {'Content-Type': 'text/html'});
            response.write("<html>\
            <body>\
            <p>can not find the page!<p>\
            </body>\
            </html>");
            response.end();
        }
        else{
            response.writeHead(200, {'Content-Type': 'text/html'});
            response.write(bytes);
            response.end();
        }
    });

});

//接口：获取上传文件列表
app.post('/file/uploading', function(request, response){
    //生成multiparty对象，并配置上传目标路径 
    var form =  new multiparty.Form();
    form.encoding = 'utf-8';
    //设置文件存储路劲
    form.uploadDir = '.\\files';
    fs.stat(form.uploadDir, function(err, stats){
        if(err){
            fs.mkdirSync(form.uploadDir);
        }
    });
    //设置文件大小限制
    form.maxFilesSize = 3*1024*1024;
    form.parse(request, function(err, fields, files){
        //var fileTemp = JSON.stringify(files, null, 2);
        if(err){
            console.log(err);
        }
        else{
            var app_name = "appDemo";
            // try{
            //     var fields_obj = JSON.stringify(fields);
            //     var fields_json = JSON.parse(fields_obj);
            //     var app_name = fields_json["app"][0];
            //     var version = fields_json["version"][0];
            //     var os_name = fields_json["os_name"][0];
            //     var os_version = fields_json["os_version"][0];
            // }
            // catch(e){
            //     console.log(e)
            //     response.writeHead(200, {'content-type': 'text/plain;charset=utf-8'});
            //     response.write('parse params error!');
            //     response.end();
            //     return;
            // }
            try{
                var inputFile = files.file_list[0];
                var uploadPath = inputFile.path;
                //创建文件夹
                var dir = ".\\files\\" + app_name;
                fs.stat(dir, function(err, stats){
                    if(err){
                        fs.mkdirSync(dir);
                    }
                    var destPth = dir + "\\" + inputFile.originalFilename;
                    //重命名为真实文件名
                    fs.rename(uploadPath, destPth, function(err){
                        if(err){
                            console.log("rename error: "+ err);
                        }
                    });
                });   
            }
            catch(e){
                response.writeHead(200, {'content-type': 'text/plain;charset=utf-8'});
                response.write('upload file: \n\n' + e);
                response.end();
            }
        }
        response.writeHead(200, {'content-type': 'text/plain;charset=utf-8'});
        response.write('upload file success.\n\n');
        response.end();
    });

});

//遍历文件目录
function get_files(dir, file_list){
    fs.readdir(dir, function(err, files){
        if(err){
            console.log(err);
            return;
        }
        var len = files.length;
        var i=0;
        while(i<len){
            var file = dir + "\\" + files[i];
            fs.stat(file, function(err, states){
                if(err){
                    console.log(err);
                }
                else{
                    if (states.isDirectory()){
                        get_files(file, file_list);
                    }
                    else if(states.isFile()){
                        file_list.push(file);
                    }
                }
            });
            ++i;
        }
        
    });

}

//异步遍历文件目录
function get_files_sync(dir, file_list){
    try{
        var files = fs.readdirSync(dir);
        var i = 0;
        while(i<files.length){
            var file = dir + "\\" + files[i];
            try{
                states = fs.statSync(file);
                if(states.isDirectory()){
                    get_files_sync(file, file_list);
                }
                else if(states.isFile()){
                    file_list.push(file);
                }
            }
            catch(err){
                console.log(err);
            }
            ++i;
        }
    }
    catch(err){
        console.log(err);
    }
}

app.get('/file_list', function(request, response){
    var dir = ".\\files";
    var file_list = new Array();
    //get_files(dir, file_list);
    get_files_sync(dir, file_list);
    result = {};
    result.msg = 'OK';
    result.code = '0';
    result.data = file_list;
    response.writeHead(200, {'content-type': 'text/plain;charset=utf-8'});
    response.write(JSON.stringify(result));
    response.end();
});

//终端打印信息
console.log("https servser is running at https://127.0.0.1");