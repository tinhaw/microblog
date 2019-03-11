// var express=require('express');
var db=require('../models/db.js');
var formidable=require('formidable');
var sd=require('silly-datetime');
var path = require("path");
var fs=require('fs');
var gm=require('gm');
var ObjectID=require('mongodb').ObjectID;


exports.loadBlog=function (req,res,next) {
    db.findBlogs(req,res,{},function (err,res,json) {
        if(err){
            res.json(json);
            return;
        }
        res.json(json);
    });
};

exports.showIndex=function (req,res,next) {
    console.log(req.cookies);
    console.log(req.session);
    if (req.session.login==1){
        var query={
            username:req.session.username
        };
        console.log('req.session.username:'+req.session.username);
        console.log('query:'+query);
        db.findUsers(req,res,query,function (err,req,res,json) {
            if(err){
                var dic={
                    username:'登录错误',
                    login: 0,
                    avatarAdd:'/avatar/default_avatar.png',
                    age:0,
                    intro:'空'
                }
                res.render('index',dic);
            }
            var dic={
                username:json.docs[0].username,
                login:req.session.login,
                sex:json.docs[0].sex,
                avatarAdd:json.docs[0].avatarAdd,
                age:json.docs[0].age,
                intro:json.docs[0].intro
            };
            res.render('index',dic);
        });

    }else {
        var dic={
            username:'游客',
            login: 0,
            avatarAdd:'/avatar/default_avatar.png',
            age:0,
            intro:'空'
        }
        res.render('index',dic);
    }
}

exports.doRegister=function (req,res,next) {
    db.registerNew(req,res,function (err,req,res,statusCode) {
        if(err){
            res.json({result:statusCode});
            return;
        }
        //如果注册成功，执行以下操作：
        res.json({result:statusCode});
        //注册成功后使页面重定向到主页
        // res.redirect('/');
    });

};

exports.doLogin=function (req,res,next) {
    db.login(req,res,function (err,res,statusCode) {
        if(err){
            res.json({result:statusCode});
            return;
        }
        res.json({result:statusCode});
        // res.redirect('/');
    });
};

exports.doLogout=function (req,res,next) {
    // console.log('req.cookies:'+req.cookies);
    res.cookie('connect.sid','0000',{expires: new Date(Date.now() - 60*1000)});
    // delete req.session.username;
    // req.cookies={};
    // req.session.login=0;
    res.json({result:1});
};

exports.insertBlog=function (req,res,next) {
    if(req.session.login==1){
        db.insertBlog(req,res,function (err,req,res,statusCode) {
            if(err){
                res.json({result:statusCode});
                return;
            }

            //如果提交成功，执行以下操作：
            res.json({result:statusCode});

        });
    }

};

exports.showHome=function (req,res,next) {
    if(req.session.login!=1){
        res.render('home',{
            login:0,
        });
        return;
    }
    var query={
        _id:new ObjectID(req.session.uid)
    };

    db.findUsers(req,res,query,function (err,req,res,json) {
        if(err){
            //如果查询用户失败
            console.log('showHome时查询用户信息失败');
            res.json({result:-1});
            return;
        }
        console.log('showHome时查询用户信息成功');

        var dic={
            login:req.session.login,
            username:json.docs[0].username,
            age:json.docs[0].age,
            sex:json.docs[0].sex,
            avatarAdd:json.docs[0].avatarAdd,
            intro:json.docs[0].intro
        };
        console.log('showHome时dic:');
        console.log(dic);
        res.render('home',dic);
    });

};

exports.cutAvatar=function (req,res,next) {
    console.log(req.query);
    var username=req.session.username;
    var w=parseInt(req.query.w);
    var h=parseInt(req.query.h);
    var x=parseInt(req.query.x);
    var y=parseInt(req.query.y);
    var dateStr=sd.format(new Date,'YYYYMMDDHHmmss');
    var ranNum=parseInt(Math.random()*9000+1000);
    var finalPath='./public/avatar/'+username+'/'+username+'_avatar'+dateStr+ranNum+'.png';

    gm('./public'+req.query.avatarAdd)
        .crop(w,h,x,y)
        .resize(100,100,"!")
        .write(finalPath,function (err) {
            if(err){
                console.log(err);
                res.json({result:-1});
                return;
            }
            //头像调整成功
            //在数据库中更新用户信息
            var updateStr={
                $set:{avatarAdd:finalPath.substr(8)}
            };
            var whereStr={
                _id:new ObjectID(req.session.uid)
            };
            db.updateUser(req,res,whereStr,updateStr,function (err,res) {
                if(err){
                    console.log("头像信息更新失败");
                    res.json({result:-2});
                    return;
                }
                console.log("头像信息更新成功");
                res.json({result:1});
            });
        });
};

exports.uploadAvatar=function (req,res,next) {
    var form=new formidable.IncomingForm();
    var savePath=path.normalize(__dirname+'/../uploadTemp/');
    form.uploadDir=path.normalize(savePath);

    form.parse(req,function (err,fields,files,next) {
        if(!files.upload_data.path){
            return;
        }
        var oldPath=files.upload_data.path;

        var extname=(/\.[\w]+$/.exec(files.upload_data.name))[0];
        var username=req.session.username;
        var newPath=path.normalize(__dirname+'/../public/avatar/'+username+'/'+username+'_avatar0'+extname);
        console.log("上传文件存储至uploadtemp成功");
        fs.rename(oldPath,newPath,function (err) {
            if(err){
                console.log("上传文件改名失败:");
                console.log(err);
                res.json({result:-1});
                return;
            }
            console.log("上传文件改名成功");
            //如果上传文件成功

            var uploadTempAdd='./public/avatar/'+username+'/'+username+'_avatar0.png';
            gm('./public/avatar/'+username+'/'+username+'_avatar0'+extname)
                .resize(500)
                .write(uploadTempAdd, function (err) {
                    if (err){
                        console.log('上传头像整理失败：');
                        console.log(err);
                        res.json({result:-1});
                        return;
                    }
                    console.log("上传头像整理成功");
                    res.json({
                        result:1,
                        uploadTempAdd:'/avatar/'+username+'/'+username+'_avatar0.png'
                    });
                    //如果整理上传图片成功

                });
        });
    });
};

exports.findSelf=function (req,res,next) {
    if (req.session.login==1){
        var query={
            username:req.session.username
        };
        db.findUsers(req,res,query,function (err,req,res,json) {
            if(err){
                console.log('reqUserInfo查询信息失败');
                res.json(json);
                return;
            }
            res.json(json);

        });
    } else{
        res.json({error:2});
    }
};

exports.showAllBlogs=function (req,res,next) {
    res.render('allBlogs',{
        login:req.session.login,
        username:req.session.username
    });
};

exports.showAllUsers=function (req,res,next) {
    res.render('allUsers',{
        login:req.session.login,
        username:req.session.username
    });
};

exports.findUsers=function (req,res,next) {
    db.findUsers(req,res,{},function (err,req,res,json) {
        if(err){
            res.json(json);
            return;
        }
        res.json(json);
    });
};

exports.updateUser=function (req,res,next) {
    var whereStr={
        username:req.body.username
    };
    var updateStr={
        $set:{
            age:req.body.age,
            sex:req.body.sex,
            intro:req.body.intro
        }
    };

    db.updateUser(req,res,whereStr,updateStr,function (err,res) {
        if (err){
            var json={
                error:1
            }
            res.json(json);
            return;
        }
        var json={
            error:0
        }
        res.json(json);
    });
};