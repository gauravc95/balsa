
var axon=require("axon")
var sock = axon.socket('req');
var index=require("./index3")

var Timer = require('tiny-timer')

let tp = new Timer()
var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "gaurav",
  password: "123"
});
const {exec} = require('child_process');

console.log("node communication on------>>",process.argv[2])
var port=parseInt (process.argv[2]);
sock.bind(port)
console.log("Sending the transaction to----->",process.argv[2])

sock.send("Result",process.argv[3],index.nodePort, function(res,err){
if (err) { console.log("Error while sending socket--announce",err)}
    console.log("Responce form",port,res)
    if(res=="You are My leader")
    {
        res=1;
    }
    else{
        res=0;
    }
    
    con.connect(function(err) {
        if (err) { console.log("Error while sending socket--announce",err)           
        process.abort();
       }        console.log("Connected!");
        var sql="insert into nodeInfo2.followerTable (value,node) values("+res+","+port+")"+";"

        console.log(sql)
        con.query(sql, function (err, result) {
            if (err) throw err;
            console.log("1 record inserted");
            console.log("node communication closed on",process.argv[2])
            process.abort();
        });
    })       
});

sock.on('error', function err(err) {
    console.error('failed to write to: ', err);
    });



