

//var axon=require('axon')
var raxon=require("axon-rpc")
var Timer = require('tiny-timer')
const kill = require('kill-port')

const child_process = require('child_process');
const {exec} = require('child_process');
var mysql = require('mysql');

var con = mysql.createConnection({
    host: "localhost",
    user: "gaurav1",
    password: "123"
});

var terms=[]


let termTimer = new Timer()
let tp = new Timer()
var nodePort=8801;
var leaderNowPort;


var axon = require('axon');
var sock = axon.socket('rep');
 
sock.connect(8801);
console.log("NOde2 Here 8801")
 
sock.on('message', function(task,msg,port, reply){
    // resize the image
    console.log("Request-",msg)
  
    switch(task)
    {
      case "election":
        var rar=generateRandomNumber(2)
        console.log("My responce-->",rar)     
        reply(rar);
      break;

      case "Result":

      if(leaderNowPort!=null){
        console.log("My responce-->","I have a leader")     
        reply("I have a leader");
      }
      else{
        leaderNowPort=port
        terms.push(port)
        console.log("My responce-->","You are My leader")     
        reply("You are My leader");
      }
      break;
      case "HB":

      if(leaderNowPort!=null){
        console.log("My responce-->","I have a leader")     
        reply(rar);
      }
      else{
        console.log("My responce-->","You are My leader")     
        reply(rar);
      }
      break;
    }
  
  });

function generateRandomNumber(max)
{
    return Math.floor(Math.random() * Math.floor(max));
}

var nodes=[7701,9901]
termTimer.start(generateRandomNumber(50000))
termTimer.on('tick', (ms) => console.log('Duration', ms))


termTimer.on('statusChanged',function(status){
    console.log(status)
    if(status=="stopped")
    {
        console.log("**************newTermTimer*********")

        leaderElection().then(function(res){     
          
            con.connect(function(err) {
                console.log("Connected!");
                var sql="DELETE FROM nodeInfo1.electionTable"
        
                console.log(sql)
                con.query(sql, function (err, result) {
                    if (err) throw err;
                    console.log("All record deleted electionTable 1");        
                });

                var sql="DELETE FROM nodeInfo1.followerTable"
        
                console.log(sql)
                con.query(sql, function (err, result) {
                    if (err) throw err;
                    console.log("All record deleted followerTable 1");
        
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

            var sql="SELECT votes FROM nodeInfo1.electionTable;"
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
                    var sql="SELECT value FROM nodeInfo1.followerTable;"
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
                    nodes.forEach(function(node){ heartbeat(node)}) 
                   
                   
                    setTimeout(function2, 125000);

                }        
                });  
            });            
                }        
                resolve(true);    
            });
        })
    })
}

function function2(node)
{
    console.log("Passed the settimout")    

    console.log("!!!!!!!!!!!!!!!!!!!!!! term finished")

}
function heartbeat(port)
{
    console.log("**************heartbeat************")
    console.log("heartbeat starts with*************",port)
    const resp=child_process.fork("./heartBeat.js",[port])

}
function askForVotes(node)
{
    console.log("**************askForVotes************")
    console.log("askForVotes",node)
    const resp=child_process.fork("./askForVotes.js",[node])
}

function announce(message,port)
{
    console.log("**************announcingToTheConsortium************")
    console.log("announceTo",port)
    const resp=child_process.fork("./announce.js",[port,message])            
   
         
}
exports.nodePort=nodePort