

//var axon=require('axon')
var raxon=require("axon-rpc")
var Timer = require('tiny-timer')
const kill = require('kill-port')

const child_process = require('child_process');
const {exec} = require('child_process');
var mysql = require('mysql');

var con = mysql.createConnection({
    host: "localhost",
    user: "gaurav",
    password: "123"
});



let termTimer = new Timer()
let tp = new Timer()
var nodePort=7701;
var term=[]

var axon = require('axon');
var sock = axon.socket('rep');
 
sock.connect(7701);
console.log("Node1 Here 7701")
 
sock.on('message', function(task,msg, reply){
    // resize the image
    console.log("Request-",msg)
  
    switch(task)
    {
      case "election":
      var rar=generateRandomNumber(2)
      console.log("My responce-->",rar)     
      reply(rar);
  
      break;
    }
  
  });

function generateRandomNumber(max)
{
    return Math.floor(Math.random() * Math.floor(max));
}

var nodes=[8801,9901]
var terms=[]
//generateRandomNumber(50000)
termTimer.start(5000)
termTimer.on('tick', (ms) => console.log('Duration', ms))


termTimer.on('statusChanged',function(status){
    console.log(status)
    if(status=="stopped")
    {
        console.log("**************newTermTimer*********")

        leaderElection().then(function(res){     
          
            con.connect(function(err) {
                console.log("Connected!");
                var sql="DELETE FROM nodeInfo.electionTable"
        
                console.log(sql)
                con.query(sql, function (err, result) {
                    if (err) throw err;
                    console.log("All record deleted electionTable");
        
                });

                var sql="DELETE FROM nodeInfo.followerTable"
        
                console.log(sql)
                con.query(sql, function (err, result) {
                    if (err) throw err;
                    console.log("All record deleted followerTable");
        
                });
            });
           termTimer.start(generateRandomNumber(50000))
        });
    }
});






async function sleep(ms){
    return new Promise(resolve=>{
        tp.start(3000)
        tp.on('statusChanged',function(status){
            resolve(true);
        })
    })
}

async function leaderElection()
{
    return new Promise(function(resolve,responce){
        console.log("**************leaderElection************")

        console.log(nodes)
        nodes.forEach(function(node){ askForVotes(node)})
    
        sleep(3000).then(function(res){

            var sql="SELECT votes FROM nodeInfo.electionTable;"
            var cnt=0;
            console.log(sql)
            con.query(sql, function (err, result) {
                if (err) throw err;
                console.log("result",result);
                
                for(var i=0;i<result.length;i++)
                {
                    if(result[i].votes==1)
                    {
                        cnt++;
                    }
                }
                console.log("count of yes votes",cnt)
                if(cnt>=nodes.length/2)
                {
                    console.log("***********************************************I am the Leader***********************************************")
                    nodes.forEach(function(node){ announce("I am the Leader!",node)})


                    sleep(4000).then(function(res){

                    //--------------------------------------------
                    var sql="SELECT value FROM nodeInfo.followerTable;"
            var cntFollower=0;
            console.log(sql)
            con.query(sql, function (err, result) {
                if (err) throw err;
                console.log("result",result);
                
                for(var i=0;i<result.length;i++)
                {
                    if(result[i].value==1)
                    {
                        cntFollower++;
                    }
                }
                console.log("count of yes votes",cnt)
                if(cnt>=nodes.length/2)
                {
                    console.log("******************************heartbeatheartbeatheartbeatheartbeat*****************************************")
                    //nodes.forEach(function(node){ heartbeat(node)})                    
          
                }        
                });  
            });            
                }        
                resolve(true);    
            });
        })
    })
}

function askForVotes(node)
{
    console.log("**************askForVotes************")
    console.log("askForVotes",node)
    const resp=child_process.fork("./comm1.js",[node])

}

function announce(message,port)
{

    console.log("**************announcingToTheConsortium************")
    console.log("announceTo",port)
    const resp=child_process.fork("./announce.js",[port,message])
            
}
function heartbeat(port)
{
    let timer = new Timer()
    var sock = axon.socket('req');
    sock.bind(port);

    timer.on('tick', (ms) => console.log('Duration', ms))
    timer.on('done', () => console.log('done!'))
    //timer.on('statusChanged', (status) => console.log('status:', status))    
    
    timer.start(50000)
    // (status) => console.log('status:', status))
    
    timer.on('statusChanged',function(status){
        console.log(status)
        if(status=="stopped")
        {
            sock.send("Hello From Leader! HeartBeat", function(res,err){
    
                console.log("Responce-",res)
                timer.start(2500)
             
            });   
        }    
    });
}



