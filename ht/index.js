//express_demo.js 文件
var email = require ('./email.js')
var qs = require('qs')
var express = require('express');
var mysql = require('mysql');     //引入mysql模块
var app = express();
var multiparty = require("multiparty");
var bodyParser = require('body-parser');//解释参考http://blog.csdn.net/yanyang1116/article/details/54847560
// 创建 application/x-www-form-urlencoded 编码解析
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var fs = require('fs');
app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
  res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By",' 3.2.1')
  if(req.method=="OPTIONS") res.send(200);/*让options请求快速返回*/
  else  next();
});
app.set('trust proxy', true);// 设置以后，req.ips是ip数组；如果未经过代理，则为[]. 若不设置，则req.ips恒为[]
var config = JSON.parse(fs.readFileSync('./config.json', 'utf8')); // 读取配置项
var baseImgUrl = config.baseImgUrl //图片上传的地址
var mysql_user = config.mysql_user
var connection = mysql.createConnection(mysql_user);    //建立数据库链接
connection.connect(function(err) {                     //链接数据库
  if (err) {      //链接错误执行
    console.log('[错误]' + err);
    connection.end();
    return;
  };
  console.log('链接成功');    //否则链接成功
});

app.get('/', function (req, res) {
  console.log("headers = " + JSON.stringify(req.headers));// 包含了各种header，包括x-forwarded-for(如果被代理过的话)
  console.log("x-forwarded-for = " + req.header('x-forwarded-for'));// 各阶段ip的CSV, 最左侧的是原始ip
  console.log("ips = " + JSON.stringify(req.ips));// 相当于(req.header('x-forwarded-for') || '').split(',')
  console.log("remoteAddress = " + req.connection.remoteAddress);// 未发生代理时，请求的ip
  console.log("ip = " + req.ip);// 同req.connection.remoteAddress, 但是格式要好一些
  res.send('Hello World');
})

app.get('/register', function (req, res) {
  console.log(req.query)
  var obj = req.query
  var userName = obj.userName
  var passWord = obj.passWord
  //编写查询语句
	var find = 'SELECT * FROM usertabe WHERE UserName = \'' + userName+'\'';
  //编写添加语句
  var insert = 'INSERT INTO usertabe (userId,userName,passWord) VALUES (?,?,?)';
  connection.query(find, function(err, result) {
		if (err) {   //链接失败 直接return;
      console.log('[错误]' + err);
      res.send(getRes(500))
			return;
    };
		if (result.length) {   //如果查到了数据
      res.send(getRes(-1,{},"账号已经存在"))
		} else {
      var timestamp = Date.parse(new Date()) + '' + Math.ceil(Math.random()*10) + Math.ceil(Math.random()*10) + Math.ceil(Math.random()*10);
			var inserInfo = [timestamp,userName, passWord];  //定义插入数据
            //执行插入数据语句
			connection.query(insert,inserInfo,function(err, result) {
        if (err) {   //链接失败 直接return;
          res.send(getRes(500))
					return;
				};
        res.send(getRes(1,{},"注册成功"))
			});
		}
	})
})
app.get('/login', function (req, res) {
  console.log(req.query)
  var obj = req.query
  var userName = '\'' + obj.userName + '\''
  var passWord = obj.passWord
  var find = 'SELECT * FROM usertabe WHERE userName = ' + userName;
  connection.query(find, function(err, result) {
		if (err) {   //链接失败 直接return;
      res(getRes(500))
			return;
		};
		if (result.length) {   //如果查到了数据
			var string = JSON.stringify(result);
			var json = JSON.parse(string)[0];
			console.log(string)
			if (json.passWord == passWord) {
        res.send(getRes(1,json,"登录成功"))
			} else {
        res.send(getRes(-1,{},"密码错误"))
			}
		} else {
      res.send(getRes(-1,{},"账号不存在"))
		}
	})
})
app.get('/updateImg',function (req,res){
  var obj = req.query
  var userId = '\'' + obj.userId + '\''
  var img=obj.headImg.split("/")
  var headImg = '\'' + img[img.length-1] + '\''
  var find = 'SELECT * FROM usertabe WHERE userId = ' + userId;
  connection.query(find, function(err, result) {
		if (err) {   //链接失败 直接return;
      res(getRes(500))
			return;
		};
		if (result.length) {   //如果查到了数据
			var string = JSON.stringify(result);
      var json = JSON.parse(string)[0];
      var update = 'update usertabe set headImg='+headImg+' where userId='+userId;  
      connection.query(update, function(err, result) {
        console.log(result)
        if (err) {   //链接失败 直接return;
          res(getRes(500))
          return;
        };
        if (result) {   //如果插入成功
          res.send(getRes(1))
        } else {
          res.send(getRes(-1))
        }
      })
			
		} else {
      res.send(getRes(-1,{},"账号不存在"))
		}
	})

})
app.post('/uploade', function (req,res) {
  var form = new multiparty.Form()
  form.uplodDir='tmp'
  form.parse(req,function(err,fields,files){
    var timestamp = Date.parse(new Date()) + '' + Math.ceil(Math.random()*10) + Math.ceil(Math.random()*10) + Math.ceil(Math.random()*10);
    var inputFile =files.file[0];
    var names = inputFile.originalFilename.split(".")
    var type = names[names.length-1]
    var readStream=fs.createReadStream(inputFile.path);
    var writeStream=fs.createWriteStream("img/"+timestamp+'.'+type);
    readStream.pipe(writeStream);
    readStream.on('end',function(){
        fs.unlinkSync(inputFile.path);
        var data={
          url:baseImgUrl + timestamp+'.'+type
        }
        res.send(getRes(1,data,'上传图片成功'))
    });
  })
})
app.get('/getUserList',function(req,res){
  console.log(req.query)
  var find = 'select * from usertabe'
  connection.query(find, function(err, result) {
    if (err) {   //链接失败 直接return;
      console.log(err)
      res.send(getRes(500))
			return;
		};
    if (result.length) {   //如果查到了数据
      res.send(getRes(1,result,"成功"))
		} else {
      res.send(getRes(-1))
		}
	})
})
// 联表查询
app.get('/getUserListAll',function(req,res){
  console.log(req.query)
  var find = 'select usertabe.userId,usertabe.userName,usertabe.headImg,`order`.orderId,`order`.name,`order`.orderNo from `order`,usertabe where `order`.userId=usertabe.userId'
  connection.query("select usertabe.userId,usertabe.userName,usertabe.headImg,order.orderId,order.name,order.orderNo from `order` left join usertabe on order.userId = usertabe.userId", function(err, result) {
    if (err) {   //链接失败 直接return;
      console.log(err)
      res.send(getRes(500))
			return;
		};
    if (result.length) {   //如果查到了数据
      res.send(getRes(1,result,"成功"))
		} else {
      res.send(getRes(-1))
		}
	})
})

// 新增
app.post('/saveList', urlencodedParser, function (req,res) {
  var data = qs.parse(req.body)
  var list = data.list
  var userId = data.userId
  var drawName = data.drawName
  var parentId = data.parentId
  if(parentId == ''){
    var timestamp = 'pid' + Date.parse(new Date()) + '' + Math.ceil(Math.random()*10) + Math.ceil(Math.random()*10) + Math.ceil(Math.random()*10);
    parentId = timestamp
  }
  
  var del = 'DELETE FROM drawList WHERE userId =' + userId + ' and parentId=\'' + parentId + '\''
  connection.query(del,function(err, result) { // 先删除  在添加
    if (err) {res.send(getRes(500));return;};
    var inserInfo = []
    for(var i = 0 ; i < list.length ; i++){
      const arr = []
      arr.push(userId)
      arr.push(parentId)
      arr.push(drawName)
      arr.push(JSON.stringify(list[i].imgUrl))
      arr.push(JSON.stringify(list[i].style))
      arr.push(JSON.stringify(list[i].childStyle))
      inserInfo.push(arr)
    }
    var insert = 'INSERT INTO drawList (userId,parentId,drawName,imgUrl,style,childStyle) VALUES ?';
        //执行插入数据语句
    connection.query(insert,[inserInfo],function(err, result) {
      if (err) {res.send(getRes(500));return;};
      res.send(getRes(1,{},"添加成功"))
    });
     
  });
})
// 获取图片列表
app.get('/getItemList',function(req,res){
  console.log(req.query)
  var find = 'select * from itemlist where userId=' + req.query.userId
  console.log(find)
  connection.query(find, function(err, result) {
    if (err) { res.send(getRes(500));return;}
    if (result.length) {   //如果查到了数据
      res.send(getRes(1,result,"成功"))
		} else {
      res.send(getRes(-1))
		}
	})
})
// 获取图片列表list
app.get('/getDrawList',function(req,res){
  console.log(req.query)
  var find = 'select * from drawList where userId=\'' + req.query.userId +'\''
  console.log(find)
  connection.query(find, function(err, result) {
    if (err) { res.send(getRes(500));return;}
    if (result.length) {   //如果查到了数据
      result = unique(result,'parentId')
      console.log(result)
      res.send(getRes(1,result,"成功"))
		} else {
      res.send(getRes(1,[]))
		}
	})
})
// 获取图片itemList
app.get('/getDrawItem',function(req,res){
  console.log(req.query)
  var find = 'select * from drawList where userId=\'' + req.query.userId + '\' and parentId=\'' + req.query.parentId + '\''
  console.log(find)
  connection.query(find, function(err, result) {
    if (err) { res.send(getRes(500));return;}
    if (result.length) {   //如果查到了数据
      console.log(result)
      res.send(getRes(1,result,"成功"))
		} else {
      res.send(getRes(1,[]))
		}
	})
})


var server = app.listen(8082, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("应用实例，访问地址为 http://%s:%s", host, port)
 
})

app.get('/sendEmail',function(req,res){
  var obj = req.query
  var toEmail = obj.toEmail
  var title = obj.title
  var content = obj.content
  email(toEmail,title,content,function(msg){
    res.send(msg)
  })
})
//获取返回字符串 传参分别是  code（必传）  data  msg
function getRes () {
  //传参分别是  code（必传）  data  msg
  var obj = {
    code: '',
    data: {},
    msg:''
  }
  obj.code = arguments[0]
  obj.data = typeof(arguments[1])=== 'undefined'?{}:arguments[1]
  switch(arguments[0]){
    case 1: obj.msg=arguments[2]?arguments[2]:"成功"; break;
    case -1: obj.msg=arguments[2]?arguments[2]:"失败"; break;
    case 500: obj.msg=arguments[2]?arguments[2]:"系统错误"; break;
  }
  return obj
}
// 数组去重（数组里面依据某个属性去重）    数组，比较字段
function unique(arr,str){            
  for(var i=0; i<arr.length; i++){
    for(var j=i+1; j<arr.length; j++){
      if(arr[i][str]==arr[j][str]){         //第一个等同于第二个，splice方法删除第二个
        arr.splice(j,1);
        j--;
      }
    }
  }
return arr;
}
