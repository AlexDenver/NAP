var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient
var db;
MongoClient.connect('mongodb://admin:appleboxspace101@ds113915.mlab.com:13915/nap', function(err, Db) {
    if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
        console.log('CONNECTED TO MONGODB');
        db = Db.db("notes");
    }
});

var download = require('./lib/download');
async function makeQuery(collection, query, mycallback, multi)  {
    if(multi){
        db.collection(collection).find(query, function(err, res){
            if(err) throw err;
            mycallback(res.toArray());
        });
    }else{
        db.collection(collection).findOne(query, function(err, res){
            if(err) throw err;
            mycallback(res);
        });
    }
} 


const exp = require("express")
const app = exp();
const bodyParser = require("body-parser");
app.use(bodyParser());
var cors = require('cors')
app.use(cors())

app.post("/elements", function(req,res){
    let eleIds;
    let resData = [];
    // db.collection("pages", function)
    const getEleIds = function (data)  {
        eleIds = data;
        // eleIds.elements.forEach(element => {
        //     console.log(element)
        //     makeQuery("elements", {_id: element}, function(eres){
        //         resData.push(eres);
        //     });
        // });
        // console.log(eleIds)
        // for(let i = 0; i < eleIds.elements.length; i++){
            // element = eleIds.elements[i];
            // console.log(element)
            // await makeQuery("elements", {pageId: eleIds._id}, function(eres){
            //     console.log(eleIds._id)
            //     console.log(eres)
            //     res.end(JSON.stringify(eres));
            // }, true);
        // }
        console.log(resData)
        
    }
    if(req.body.id)
        await makeQuery("pages", {_id: req.body.id}, getEleIds);
    else
        await makeQuery("pages", {isHome: true}, getEleIds);        
    
})



app.post("/image", function(req, res){
    // console.log(req)
    ext = req.body.img.split(".");
    ext = ext[ext.lengt-1]
    download(req.body.img, "./download/images/"+req.body.id+"."+ext, function (state) {
            console.log("progress", state);
        }, function (response) {
            console.log("status code", response.statusCode);
        }, function (error) {
            console.log("error", error);
        }, function () {
            console.log("done");
        });
})
.listen(1090,function(err){
	if(err) throw err;
	console.log("Listening on Port http://localhost:1090");
});