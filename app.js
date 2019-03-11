var express=require('express');
var router=require('./controller/router.js');
var bodyParser = require('body-parser');
var multer = require('multer');
var cookieParser=require('cookie-parser');
var session=require('express-session');
var app=express();
var upload = multer();

app.use(cookieParser());
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 15*60*1000 }
}));
app.use(express.static('./public'));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.set('view engine','ejs');

app.get('/',router.showIndex);
app.get('/home',router.showHome);
app.get('/cutAvatar',router.cutAvatar);
app.get('/allBlogs',router.showAllBlogs);
app.get('/allUsers',router.showAllUsers);

app.post('/loadBlog', upload.array(),router.loadBlog);

app.post('/doRegister',upload.array(),router.doRegister);
app.post('/doLogin',upload.array(),router.doLogin);
app.post('/doLogout',router.doLogout);
app.post('/postBlog',router.insertBlog);
app.post('/uploadAvatar',router.uploadAvatar);
app.post('/reqSelfInfo',router.findSelf);
app.post('/reqUsersfInfo',router.findUsers);
app.post('/updateSelf',router.updateUser);




app.listen(3000);