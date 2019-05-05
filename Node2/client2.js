var axon = require('axon');
var sock = axon.socket('rep');
 
sock.connect(8801);
console.log("Client Here 8801")
 
sock.on('message', function(task,msg, reply){
    // resize the image
    console.log("Request-",msg)
  
    switch(task)
    {
      case "election":
      var rar=generateRandomNumber(2)
      console.log(rar)     
      reply(rar);
  
      break;
    }
  
  });

function generateRandomNumber(max)
{
    return Math.floor(Math.random() * Math.floor(max));
}