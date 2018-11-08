const app             = require('express')();
const express         = require('express');
const https           = require('https');
const fs              = require('fs');
const bodyParser      = require('body-parser');
const path            = require('path');


// Don't forget to change the hostname on SERVER_IP!
const SERVER_PORT     = 443;
const SERVER_IP       = "131-193-76-235.evl.uic.edu";

// SSL Certificate stuff for https
var privateKey  = fs.readFileSync("keys/_.evl.uic.edu.key", 'utf8');
var certificate = fs.readFileSync("keys/_.evl.uic.edu.crt", 'utf8');
var ca = fs.readFileSync("keys/_.evl.uic.edu-ca.crt").toString();
var credentials = {key: privateKey, cert: certificate,ca:ca};

// for when you get an alexa related request
app.use(bodyParser.json({ type: 'application/json' }));

var httpsServer = https.createServer(credentials, app);

// Server up and the following files are included.
httpsServer.listen(SERVER_PORT, SERVER_IP, function () {
    console.log('Application ready on ' + SERVER_IP+":"+SERVER_PORT+" via https. Be happy!");
});

const io = require('socket.io').listen(httpsServer);

// Routing
app.use(express.static(__dirname + '/public'));

// Chatroom
var numUsers = 0;

io.on('connection', function (socket) {
  var addedUser = false;

  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    if (addedUser) {
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});
