


var axon=require("axon")
var sock = axon.socket('req');
var Timer = require('tiny-timer')
let timer = new Timer()
var mysql = require('mysql');
var index=require("./index3")

var con = mysql.createConnection({
  host: "localhost",
  user: "gaurav",
  password: "123"
});
const {exec} = require('child_process');

console.log("node communication on------>>",process.argv[2])
var port=parseInt (process.argv[2]);


sock.bind(port);

timer.on('tick', (ms) => console.log('Duration', ms))
timer.on('done', () => console.log('done!'))
//timer.on('statusChanged', (status) => console.log('status:', status))    
var cnt=1;;
timer.start(2500)
// (status) => console.log('status:', status))

timer.on('statusChanged',function(status){
    console.log(status)
    cnt++;
    if(status=="stopped")
    {
        sock.send("HB","Hello From Leader! HeartBeat"+cnt,index.nodePort, function(res,err){

            console.log("Responce-",res)
            if(cnt<=30)
            {
                timer.start(2500)
            }else
            {
               console.log("*******************Ending the heartbeat with*******************",port) 
            }
         
        });   
    }    
});

sock.on('error', function err(err) {
    console.error('failed to write to: ', err);
     console.log("Error while sending socket--announce",err)           
    process.abort();

    });






