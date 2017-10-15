var express = require("express");
var app = express();
var router = require("./router/router.js");
var session = require('express-session');

var utils = require('./models/utils');

app.all('*',function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');

  if (req.method == 'OPTIONS') {
    res.send(200); //让options请求快速返回
  } else {
    next();
  }
});

//使用session
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));
app.use(function (req, res, next) {
    res.locals.utils = utils;
    next();
});
//模板引擎
app.set("view engine","ejs");
//静态页面
app.use(express.static("./public"));

//路由表
app.get("/",router.showIndex);              //显示首页


app.get("/getSelectValue",router.getSelectValue);      //获取下拉框数据

app.post("/doRegist",router.doRegist);      //执行注册，Ajax服务
app.post("/checkUser",router.checkUser);      //用户名是否存在

app.post("/dologin",router.doLogin);        //执行登陆


app.post("/doEdit",router.doEdit);        //创建文章
app.post("/doDelete",router.doDelete);        //删除文章

app.post("/getArticleList",router.getArticleList);        //获取文章列表个人
app.post("/getArticleListAll",router.getArticleListAll);        //获取文章列表全部
app.post("/getArticleDetail",router.getArticleDetail);        //获取文章详情


app.post("/getArticleListAllAdmin",router.getArticleListAllAdmin);        //管理员-获取文章列表

app.post("/getUsersListAdmin",router.getUsersListAdmin);        //超级管理员-获取所有用户信息
app.post("/userDelete",router.userDelete);        //超级管理员-删除所有用户信息
app.post("/editUsers",router.editUsers);        //超级管理员-修改管理员信息



app.post("/doPropose",router.doPropose);        //输入建议
app.post("/getProposeList",router.getProposeList);        //查看建议




// app.get("/regist",router.showRegist);       //显示注册页面

// app.get("/login",router.showLogin);         //显示登陆页面

// app.get("/setavatar",router.showSetavatar); //设置头像页面
// app.post("/dosetavatar",router.dosetavatar);//执行设置头像，Ajax服务
// app.get("/cut",router.showcut);             //剪裁头像页面
// app.post("/post",router.doPost);            //发表说说
// app.get("/docut",router.docut);             //执行剪裁
// app.get("/getAllShuoshuo",router.getAllShuoshuo);  //列出所有说说Ajax服务
// app.get("/getuserinfo",router.getuserinfo);  //列出所有说说Ajax服务
// app.get("/getshuoshuoamount",router.getshuoshuoamount);  //说说总数
// app.get("/user/:user",router.showUser);  //显示用户所有说说
// app.get("/post/:oid",router.showUser);  //显示用户所有说说
// app.get("/userlist",router.showuserlist);  //显示所有用户列表


app.listen(3000);
