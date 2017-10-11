/**
 * Created by Danny on 2015/9/26 15:39.
 */
var formidable = require("formidable");
var db = require("../models/db.js");
var md5 = require("../models/md5.js");
var path = require("path");
var fs = require("fs");
var gm = require("gm");






//首页
exports.showIndex = function (req, res, next) {
    //检索数据库，查找此人的头像
    if (req.session.login == "1") {
        //如果登陆了
        var user_name = req.session.user_name;
        var login = true;
    } else {
        //没有登陆
        var user_name = "";  //制定一个空用户名
        var login = false;
    }
    //已经登陆了，那么就要检索数据库，查登陆这个人的头像
    db.find("users", {user_name: user_name},function (err, result) {
        if (result.length == 0) {
            var avatar = "moren.jpg";
        } else {
            var avatar = result[0].avatar;
        }
        res.json({
            "login": login,
            "user_name": user_name,
            "active": "首页",
            "avatar": avatar    //登录人的头像
        });
    });
};


//获取注册下拉框数据
exports.getSelectValue = function(req, res, next) {
    db.find("sources", {},function (err, result) {
        res.send({"result":result});
    });
}

//查询有没有这个人
exports.checkUser = function (req, res, next) {
    //得到用户填写的东西
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        // console.log(fields);
        //得到表单之后做的事情
        var user_name = fields.user_name;
        db.find("users", {"user_name": user_name}, function (err, result) {
            if (err) {
                res.send({result:"-3"}); //服务器错误
                return;
            }
            if (result.length != 0) {
                res.send({result:"-1"}); //被占用
                return;
            }else{
                res.send({result:"1"}); //注册成功，写入session
                return;
            }

        });
    })// 查询数据库中是不是有这个人
};

//注册业务
exports.doRegist = function (req, res, next) {
    //得到用户填写的东西
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        // console.log(fields);
        //得到表单之后做的事情
        var user_name = fields.user_name;
        var password = fields.password;
        var checkPass = fields.checkPass;//二次验证密码
        var source_id = fields.source_id;

        db.getAllCount("users", function (count) {//查找有几个人,长度作为user_id
            // console.log(count);
            db.find("users", {"user_name": user_name}, function (err, result) {
                if (err) {
                    res.send({result:"-3"}); //服务器错误
                    return;
                }
                if (result.length != 0) {
                    res.send({result:"-1"}); //被占用
                    return;
                }
                //没有相同的人，就可以执行接下来的代码了：
                //设置md5加密
                password = md5(password);
                //现在可以证明，用户名没有被占用
                db.insertOne("users", {
                    "user_name": user_name,
                    "password": password,
                    "checkPass": checkPass,
                    "source_id": source_id,
                    "user_id": count+1,
                }, function (err, result) {
                    if (err) {
                        res.send({result:"-3"}); //服务器错误
                        return;
                    }
                    req.session.login = "1";
                    req.session.user_name = user_name;
                    res.send({result:"1",user_name:user_name,user_id : count+1}); //注册成功，写入session
                })
            });
        })// 查询数据库中是不是有这个人

    });


};



//登陆页面的执行
exports.doLogin = function (req, res, next) {
    //得到用户表单
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        //得到表单之后做的事情
        var user_name = fields.user_name;
        var password = fields.password;
        var jiamihou = md5(password);
        //查询数据库，看看有没有个这个人
        db.find("users", {"user_name": user_name}, function (err, result) {
            console.log(result);
            if (err) {
                res.send({result:"-5"});
                return;
            }
            //没有这个人
            if (result.length == 0) {
                res.send({result:"-1"}); //用户名不存在
                return;
            }

            //有的话，进一步看看这个人的密码是否匹配
            if (jiamihou == result[0].password) {
                req.session.login = "1";
                req.session.user_name = user_name;
                res.send({result:"1",user_name:user_name,user_id : result[0].user_id});  //登陆成功
                return;
            } else {
                res.send({result:"-2"});  //密码错误
                return;
            }
        });
    });
};
















//注册页面
exports.showRegist = function (req, res, next) {
    res.render("regist", {
        "login": req.session.login == "1" ? true : false,
        "user_name": req.session.login == "1" ? req.session.user_name : "",
        "active": "注册"
    });
};





//显示登陆页面
exports.showLogin = function (req, res, next) {
    res.render("login", {
        "login": req.session.login == "1" ? true : false,
        "user_name": req.session.login == "1" ? req.session.user_name : "",
        "active": "登陆"
    });
};



//设置头像页面，必须保证此时是登陆状态
exports.showSetavatar = function (req, res, next) {
    //必须保证登陆
    if (req.session.login != "1") {
        res.end("非法闯入，这个页面要求登陆！");
        return;
    }
    res.render("setavatar", {
        "login": true,
        "user_name": req.session.user_name || "小花花",
        "active": "修改头像"
    });
};

//设置头像
exports.dosetavatar = function (req, res, next) {
    //必须保证登陆
    if (req.session.login != "1") {
        res.end("非法闯入，这个页面要求登陆！");
        return;
    }

    var form = new formidable.IncomingForm();

    form.uploadDir = path.normalize(__dirname + "/../avatar");//上传的文件夹

    form.parse(req, function (err, fields, files) {
        console.log(files);
        var oldpath = files.touxiang.path;
        var newpath = path.normalize(__dirname + "/../avatar") + "/" + req.session.user_name + ".jpg";
        //改文件名字
        fs.rename(oldpath, newpath, function (err) {
            if (err) {
                res.send("失败");
                return;
            }
            req.session.avatar = req.session.user_name + ".jpg";
            //跳转到切的业务
            res.redirect("/cut");//重新路由,方式：get
        });
    });
}

//显示切图页面
exports.showcut = function (req, res) {
    //必须保证登陆
    if (req.session.login != "1") {
        res.end("非法闯入，这个页面要求登陆！");
        return;
    }
    res.render("cut", {
        avatar: req.session.avatar
    })
};

//执行切图
exports.docut = function (req, res, next) {
    //必须保证登陆
    if (req.session.login != "1") {
        res.end("非法闯入，这个页面要求登陆！");
        return;
    }
    //这个页面接收几个GET请求参数
    //w、h、x、y
    var filename = req.session.avatar;
    var w = req.query.w;
    var h = req.query.h;
    var x = req.query.x;
    var y = req.query.y;

    gm("./avatar/" + filename)
        .crop(w, h, x, y)
        .resize(100, 100, "!")
        .write("./avatar/" + filename, function (err) {
            if (err) {
                res.send("-1");
                return;
            }
            //更改数据库当前用户的avatar这个值
            db.updateMany("users", {"user_name": req.session.user_name}, {
                $set: {"avatar": req.session.avatar}
            }, function (err, results) {
                res.send("1");
            });
        });
}


//发表说说
exports.doPost = function (req, res, next) {
    //必须保证登陆
    if (req.session.login != "1") {
        res.end("非法闯入，这个页面要求登陆！");
        return;
    }
    //用户名
    var user_name = req.session.user_name;

    //得到用户填写的东西
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        //得到表单之后做的事情
        var content = fields.content;

        //现在可以证明，用户名没有被占用
        db.insertOne("posts", {
            "user_name": user_name,
            "datetime": new Date(),
            "content": content
        }, function (err, result) {
            if (err) {
                res.send("-3"); //服务器错误
                return;
            }
            res.send("1"); //注册成功
        });
    });
};


//列出所有说说，有分页功能
exports.getAllShuoshuo = function(req,res,next){
    //这个页面接收一个参数，页面
    var page = req.query.page;
    db.find("posts",{},{"pageamount":6,"page":page,"sort":{"datetime":-1}},function(err,result){
        res.json(result);
    });
};


//列出某个用户的信息
exports.getuserinfo = function(req,res,next){
    //这个页面接收一个参数，页面
    var user_name = req.query.user_name;
    db.find("users",{"user_name":user_name},function(err,result){
        if(err || result.length == 0){
            res.json("");
            return;
        }
        var obj = {
            "user_name" : result[0].user_name,
            "avatar" : result[0].avatar,
            "_id" : result[0]._id
        };
        res.json(obj);
    });
};

//说说总数
exports.getshuoshuoamount = function(req,res,next){
    db.getAllCount("posts",function(count){
        res.send(count.toString());
    });
};

//显示某一个用户的个人主页
exports.showUser = function(req,res,next){
    var user = req.params["user"];
    db.find("posts",{"user_name":user},function(err,result){
       db.find("users",{"user_name":user},function(err,result2){
           res.render("user",{
               "login": req.session.login == "1" ? true : false,
               "user_name": req.session.login == "1" ? req.session.user_name : "",
               "user" : user,
               "active" : "我的说说",
               "cirenshuoshuo" : result,
               "cirentouxiang" : result2[0].avatar
           });
       });
    });

}

//显示所有注册用户
exports.showuserlist = function(req,res,next){
    db.find("users",{},function(err,result){
        res.render("userlist",{
            "login": req.session.login == "1" ? true : false,
            "user_name": req.session.login == "1" ? req.session.user_name : "",
            "active" : "成员列表",
            "suoyouchengyuan" : result
        });
    });
}
