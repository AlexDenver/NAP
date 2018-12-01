var express = require('express');
var app = express();
var cors = require('cors');
var app = express();
var mongo = require('mongodb');
var ObjectId = mongo.ObjectID;
// var session = require('express-session');
// app.set('trust proxy', 1) // trust first proxy
// app.use(session({
//     secret: 'abstract nap',
//     resave: false,
//     saveUninitialized: true,
//     cookie: {
//         secure: true
//     }
// }))





var app = express();
const bodyParser = require("body-parser");
app.use(bodyParser());
app.use(cors());

COLLECTION_NAME = 'elements';


var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://admin:appleboxspace101@ds113915.mlab.com:13915/nap";

var db

MongoClient.connect(url, (err, client) => {
    if (err) return console.log(err)
    db = client.db('nap')
    app.listen(1090, () => {
        console.log('listening on 1090')
    })
})













app.get('/test', (req, res) => {
    db.collection('elements').insert({
        name: "Life",
        pid: '123'
    }, (err, result) => {
        if (err) return console.log(err)

        console.log('saved to database')
        res.redirect('/t')
    })
})



app.get('/t', (req, res) => {
    var cursor = db.collection('elements').find({}).toArray((er, arr) => {

        res.end(JSON.stringify(arr))
    })
})




app.get('/all', (req, res) => {
    var cursor = db.collection('elements').find().toArray((er, arr) => {
        res.end(JSON.stringify(arr));
    })
})


app.get('/page/', (req, res) => {
    var cursor = db.collection('elements').find({
        isHome: true
    }).toArray((er, arr) => {
        res.end(JSON.stringify(arr));
    })
})



app.post('/new', (req, res) => {
    pid = req.params.pid;
    data = req.params.data;
    element = {
        type: type,
        pid: pid,
        content: {
            data: data,
            type: type
        }
    }


    var cursor = db.collection('elements').insert(element)
    res.end(JSON.stringify(arr));
})



app.get('/page/:id', (req, res) => {

    var cursor = db.collection('elements').find({
        "pid": req.params.id
    }).toArray((er, arr) => {
        res.end(JSON.stringify(arr));
    })
})




app.post('/sign-up', (req, res) => {
    userInfo = {
        email: req.body.email,
        password: req.body.password
    }
    console.log(req)
    console.log(req.body);
    db.collection('users').insert(userInfo, (err, result) => {
        if (err) return console.log(err)

        console.log('saved to database')
        // res.redirect('/#!/login')
        res.end("ok");
    })
})






app.post('/update', (req, res) => {
    let t = req.body;
    // console.log(t);
    if(t._id == "temp124" || t._id == "temp123")
        res.status(200).end();
    else if(t.type == "zindex"){
        console.log(t);
        db.collection("elements").update({"_id": ObjectId(t._id)} , {$set: { "dim.z": t.z} });        
    }else if(t.type == "move"){
        db.collection("elements").update({"_id": ObjectId(t._id)} , {$set: { "pid": ObjectId(t.pageId)} });        

    }else{
        if(t.type == "resize")
            db.collection("elements").update({"_id": ObjectId(t._id)} , {$set: { "dim.width": t.dim.width, "dim.height": t.dim.height } });
        else if (t.type == "drag")
            db.collection("elements").update({"_id": ObjectId(t._id)} , {$set: { "dim.top": t.dim.top, "dim.left": t.dim.left} });        
    }
    res.status(200).end();
})


















app.post("/edit", function(req, res){
    let t = req.body;
    if(t.type == "folder"){
        db.collection("elements").update({"_id": ObjectId(t.id)} , {$set: { "content.title": t.data} });        
    }else if(t.type == "newfolder"){        
        db.collection("pages").insert({}, function(err, data){
            let udata = {type: 'folder', content: {title: t.title, target: data.ops[0]._id}, dim: {}, options: {}};
            udata.pid = ObjectId(t.pid);
            db.collection("elements").insert(udata, function(err, data){
                res.status(200).end(JSON.stringify(data))
            })
        });                
    }else if(t.type == "delfolder"){
        db.collection("elements").remove({"_id": ObjectId(t.id)}); 
    }else if(t.type == "newnote"){
        let udata = {content: {title: t.title, body: "Enter Text Here..."}, dim: {height: 100, width: 150}, options: {}};
        udata.pid = ObjectId(t.pageId);
        db.collection("elements").insert(udata, function(err, data){
            res.status(200).end(JSON.stringify(data))
        })
    }else if(t.type == "strip"){
        db.collection("elements").update({"_id": ObjectId(t.id)} , {$set: { "options.color": t.color} });        
    }else if(t.type == "contents"){
        db.collection("elements").update({"_id": ObjectId(t.id)} , {$set: { "content.data": t.text} });        
    }else if(t.type == "delete"){
        db.collection("elements").remove({"_id": ObjectId(t.id)}); 
        res.status(200).end();       
    }else if(t.type == "clone"){
        db.collection("elements").findOne({"_id": ObjectId(t.id)}, function(err, data){
            if(err)
                throw err;
            data.dim.left = parseFloat(data.dim.left) + 10;
            data.dim.top = parseFloat(data.dim.top) + 10;
            let newElement = {
                pid: data.pid,
                dim: data.dim,
                content: data.content,
                options: data.options
            }
            db.collection("elements").insert(newElement, function(err, data){                
                res.status(200).end(JSON.stringify(data))
            });        
        })
    }
})