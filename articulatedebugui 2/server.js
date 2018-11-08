// Required to run server
const app             = require('express')();
const express         = require('express');
const https           = require('https');
const fs              = require('fs');
const bodyParser      = require('body-parser');
const context         = require('aws-lambda-mock-context');
const path            = require('path');

// Required to do basic text mining operations
const tm              = require('textmining');


// lambda.js contains the lambda function for Alexa as in https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs
var   lambda          = require('./lambda');

// Don't forget to change the hostname on SERVER_IP!
const SERVER_PORT     = 443;
const SERVER_IP       = "aalsai3.evl.uic.edu"; //my hostname

// SSL Certificate stuff for https
var privateKey  = fs.readFileSync("keys/_.evl.uic.edu.key", 'utf8');
var certificate = fs.readFileSync("keys/_.evl.uic.edu.crt", 'utf8');
var ca = fs.readFileSync("keys/_.evl.uic.edu-ca.crt").toString();
var credentials = {key: privateKey, cert: certificate,ca:ca};

var txtfile = 'public/transcript.txt';
var rawTxt;

// for when you get an alexa related request
app.use(bodyParser.json({ type: 'application/json' }));

// your service will be available on <YOUR_IP>/alexa
app.post('/alexa/', function (req, res) {
    console.log('Got a post and emitting = ' , JSON.stringify(req.body.request.intent.slots.Commands.value, null,2));
    io.emit('spokenMSG', JSON.stringify(req.body.request.intent.slots.Commands.value));
    var ctx = context();
    lambda.handler(req.body,ctx);
    ctx.Promise
        .then(resp => {  return res.status(200).json(resp); })
        .catch(err => {  console.log(err); })
});

var httpsServer = https.createServer(credentials, app);

// Server up and the following files are included.
httpsServer.listen(SERVER_PORT, SERVER_IP, function () {
    console.log('Application ready on ' + SERVER_IP+":"+SERVER_PORT+" via https. Be happy!");
});

const io = require('socket.io').listen(httpsServer);

// Routing for "Home Directory"
app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket){
  console.log('Client connected to server');

  socket.on("speechToText", function(msg) {
    var timestamp = Object.keys(msg)[0];
    var nextWriteString = '' + timestamp + ': \n';

    for ( var i in msg[timestamp]) {
      nextWriteString += msg[timestamp][i] + '\n';
    }

    nextWriteString += '\n\n';
    console.log(nextWriteString);

    fs.appendFile(txtfile, nextWriteString, function (err){
      console.log(err);
    });
  });

  socket.on("input", function() {
    var filename = 'public/sample.txt';
    fs.readFile(filename, 'utf8', (err, data) => {
      if (err) throw err;
      console.log('OK reading: ' + filename);
      console.log('Data is = \n' + data);

      rawTxt = data;
    });
  });


  // analyze the text file
  socket.on("output", function() {
    // Build a Bag Of Words (automatically normalize and remove stop words in the process)
    var bag = tm.bagOfWords(rawTxt, true, true );

    // Sort terms by their frequency.
    var termsByFrequency = bag.terms.sort(function(a,b){
    if( a.frequency > b.frequency ) 		return -1;
      else if( a.frequency < b.frequency ) 	return 1;
      else return 0;
    });
    console.log('Now let us analyze the text file \n:');
    console.log( termsByFrequency.slice(0, 10) );



  });



  socket.on('disconnect', function () {
    console.log('Client disconnected.');

  });
});
