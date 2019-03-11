var MongoClient=require('mongodb').MongoClient;

var crypto=require('crypto');
var fs=require('fs');
var path=require('path');


function _md5(password) {
    var md5=crypto.createHash('md5');
    var password=md5.update(password).digest('hex');
    return password;
}

var url='mongodb://localhost:27017';
var dbname='dinghaoDB';



exports.findBlogs=function (req,res,query,callback) {
    var client=new MongoClient(url,{useNewUrlParser:true});
    client.connect(function (err) {
        if (err){
            console.log("findBlogs时数据库连接失败"+err);
            var json={
                error:1
            };
            callback(err,res,json);
            client.close();
            return;
        }
        var db=client.db(dbname);
        console.log('查询时连接数据库成功');
        var page=parseInt(req.body.page);
        var percount=parseInt(req.body.percount);
        db.collection('blogs').find(query).limit(percount).skip(page*percount).sort({_id:-1}).toArray(function (err,docs) {
            if (err){
                console.log("查询时数据库读取失败:"+err);
                var json={
                    error:0,
                    result:docs,
                    // count:
                }
                callback(err,res,json);
                client.close();
                return;
            }
            var json={
                error:0,
                result:docs
            };
            db.collection('blogs').countDocuments({},function (err,num) {
                json.count=num;
                console.log("findBlogs:");
                console.log(json);
                callback(null,res,json);
                client.close();
            });

        });
    });
};

exports.findUsers=function (req,res,query,callback) {
    var client=new MongoClient(url,{useNewUrlParser:true});
    client.connect(function (err) {
        if (err){
            console.log("findUsers时数据库连接失败"+err);
            callback(err,req,res,null);
            client.close();
            return;
        }
        var db=client.db(dbname);
        console.log('findUsers时连接数据库成功');
        //可以尝试使用rejection屏蔽字段
        var page=parseInt(req.body.page);
        var percount=parseInt(req.body.percount);

        db.collection('users').find(query,{projection:{"password":0},skip:page*percount,limit:percount}).toArray(function (err,docs) {
            if (err){
                console.log("findUsers时数据库读取失败:"+err);
                callback(err,req,res,null);
                client.close();
                return;
            }
            console.log('查询数据库结果:');
            console.log(docs);
            var json={
                error:0,
                docs:docs
            };
            db.collection('users').countDocuments({},function (err,num) {
                json.count=num;
                console.log("findUsers:");
                console.log(json);
                callback(null,req,res,json);
                client.close();
            });
        });

    });
};

exports.registerNew=function (req,res,callback) {
    var client=new MongoClient(url,{useNewUrlParser:true});
    client.connect(function (err) {
        if (err){
            console.log("注册时数据库连接失败："+err);
            callback(err,req,res,-1);
            client.close();
            return;
        }

        var db=client.db(dbname);
        console.log('注册时连接数据库成功');
        // console.log(req.body);

        var query={
            username:req.body.username
        };

        db.collection('users').find(query).toArray(function (err,docs) {
            if(err){
                console.log("注册时查询数据库失败："+err);
                callback(err,req,res,-1);
                client.close();
                return;
            }
            if(docs.length==0){
                var username=req.body.username;
                var password=req.body.password;

                //对密码进行md5加密
                password=_md5(password);
                //生成doc
                var doc={
                    'username':username,
                    'password':password,
                    'avatarAdd':'/avatar/default_avatar.png',
                    'age':0,
                    'sex':'未填写',
                    'intro':'未填写'
                };
                db.collection('users').insertOne(doc,function (err,result) {
                    if (err){
                        console.log("注册时插入数据失败");
                        callback(err,req,res,-1);
                        client.close();
                        return;
                    }
                    //注册成功
                    var dirPath=path.normalize(__dirname+'/../public/avatar/'+req.body.username+'/');
                    fs.mkdir(dirPath,function (err) {
                        if(err){
                            console.log('创建个人相册失败');
                        }
                        // console.log(result);
                        callback(null,req,res,1);
                        client.close();
                    });

                });
            }else {
                callback(null,req,res,-2);
                client.close();
            }
        });
    });
};

exports.login=function (req,res,callback) {
    var client=new MongoClient(url,{useNewUrlParser:true});
    client.connect(function (err) {
        if(err){
            console.log('登录时数据库连接失败：'+err);
            callback(err,res,-2);
            client.close();
            return;
        }
        var db=client.db(dbname);
        var username=req.body.username;
        //对用户密码进行加密处理
        var password=_md5(req.body.password);

        var query={
            username:username,
        };
        db.collection('users').find(query).toArray(function (err,docs) {
            if(err){
                console.log('登录时查询数据库失败：'+err);
                callback(err,res,-2);
                client.close();
                return;
            }

            console.log('登录时查询数据库成功。');
            //对查询接过进行校验
            if(docs.length==0){
                //用户名不存在
                callback(null,res,-1);
                client.close();
            }else{
                if(docs[0].password!=password){
                    //用户名存在，但是密码不匹配
                    callback(null,res,-1);
                    client.close();
                }else{
                    //登录成功

                    req.session.username=docs[0].username;
                    req.session.login=1;
                    req.session.avatarAdd=docs[0].avatarAdd;
                    req.session.uid=docs[0]._id;

                    callback(null,res,1);
                    client.close();
                }
            }
        });
    })
};

exports.insertBlog=function (req,res,callback) {
    var client=new MongoClient(url,{useNewUrlParser:true});
    client.connect(function (err) {
        if (err){
            console.log("insertBlog时数据库连接失败："+err);
            callback(err,req,res,-1);
            client.close();
            return;
        }
        var db=client.db(dbname);
        console.log('insertBlog时连接数据库成功');
        // 生成doc
        var doc={
            content:req.body.content,
            uid:req.session.uid,
            author:req.session.username,
            avatarAdd:req.session.avatarAdd,
            date:req.body.date
        };

        db.collection('blogs').insertOne(doc,function (err,result) {
            if(err){
                callback(err,req,res,-1);
                client.close();
                return;
            }
            callback(null,req,res,1);
            client.close();

        });

    });

};

function updateUser(req,res,whereStr,updateStr,callback) {
    var client=new MongoClient(url,{useNewUrlParser:true});
    client.connect(function (err) {
        if (err){
            //如果连接错误
            console.log('updateUser时连接数据库失败');
            console.log(err);
            callback(err,res);
            return;
        }
        var db=client.db(dbname);
        db.collection('users').updateOne(whereStr,updateStr,function (err,result) {
            if(err){
                console.log('updateUser时更新users失败');
                console.log(err);
                callback(err,res);
                return;
            }
            console.log('updateUser时更新users成功');
            console.log(updateStr);
            if(updateStr.$set.avatarAdd){
                var blogWhereStr={
                    author:req.session.username
                };
                var blogUpdatestr=updateStr;
                console.log('blogWhereStr:');
                console.log(blogWhereStr);

                console.log('blogUpdatestr:');
                console.log(blogUpdatestr);

                db.collection('blogs').updateMany(blogWhereStr,blogUpdatestr,function (err,result) {
                    if(err){
                        console.log('updateUser时更新blogs失败');
                        console.log(err);
                        callback(err,res);
                        return;
                    }
                    console.log('updateUser时更新blogs成功');
                    callback(null,res);
                    client.close();
                });
            }else{
                callback(null,res);
                client.close();
            }

        });
    });
};
exports.updateUser=updateUser;

function updateBlog(req,res,whereStr,updateStr,callback) {
    var client=new MongoClient(url,{useNewUrlParser:true});
    client.connect(function (err) {
        if (err){
            //如果连接错误
            callback(err,res);
            return;
        }
        var db=client.db(dbname);
        db.collection('blogs').updateOne(whereStr,updateStr,function (err,result) {
            if(err){
                callback(err,res);
                return;
            }
            callback(null,res);
        });
        client.close();
    });
};
exports.updateBlog=updateBlog;
