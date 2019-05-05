
var axon=require("axon")
var sock = axon.socket('req');

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
console.log("Sending the transaaction to----->",process.argv[2])
sock.send("election","Hello From Node 1, Please vote for me!!", function(res,err){
if (err) throw err
    console.log("Responce form",port,res)

    if(res==null)
    {
        res=0;
    }
    
    console.log("node communication closed on",process.argv[2])
    
    con.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
        var sql="insert into nodeInfo.electionTable (votes,voter) values("+res+","+port+")"+";"

        console.log(sql)
        con.query(sql, function (err, result) {
            if (err) throw err;
            console.log("1 record inserted");
            process.abort();

          });


      });

   
});

sock.on('error', function err(err) {
    console.error('failed to write to: ', err);
    });



