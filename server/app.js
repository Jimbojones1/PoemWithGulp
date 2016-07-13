require('dotenv').config();
 var express = require('express'),
    app      = express(),
    server   = require('http').createServer(app),
    io       = require('socket.io').listen(server),
    router   = express.Router(),
    bodyParser = require('body-parser'),
    cors       = require('cors'),
    path = require('path');




app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}))


// Requiring Database
require('./db/db')

// Requiring Models
PrivateMessageModel = require('./models/PrivateMessageModel')

// Routes
app.get('/', function(req, res){
  res.sendFile(__dirname + '/views/index.html')
})


app.get('/taco', function(req, res){
  PrivateMessageModel.find(function(err, Tasks){
    res.json(Tasks)
  })
})



app.get('/burrito', function(req, res){
    var prvMsgDataObject = {}
    console.log(PrivateMessageModel)
    prvMsgDataObject.recipients = []
    prvMsgDataObject.chatHistory = []
    prvMsgDataObject.chatHistory.push({
      timestamp: Date.now(),
      recipient: 'Billy BOy Boy',
      sender: 'Jimbo Jimbo',
      content: 'Are you a real boy?'
    })
    prvMsgDataObject.recipients.push('jim', 'billy Boy');

    PrivateMessageModel.create(prvMsgDataObject, function (err, task) {
    console.log(task);
    res.json(task)
  });
})

// Socket Server Code

var onlineClients = {},
    usernames     = {};


io.sockets.on('connect', function(socket){

  socket.on('disconnect', function(){
    delete usernames[socket.username]
    io.sockets.emit('updateUsers', Object.keys(usernames))


  })


  socket.on('adduser', function(username){
    console.log(username.username)
    //  Here I'm saving the username of the current socket
    socket.username = username.username;
    // we store the username in socket session for this client
    // username = socketid string
    onlineClients[username.username] = socket.id;
    // add the client's username to the global list
    //username = string value username
    usernames[username.username] = username.username

    socket.emit('updateChat', 'Welcome ' + socket.username + ', may inspiration move you brightly, everyday.', username.username)
    // console.log(onlineClients)
    // console.log(usernames)
    socket.broadcast.emit('updateUsers', Object.keys(usernames))
    socket.emit('updateUsers', Object.keys(usernames))
  })

  // private message socket Info
  //---------------------------------------------//
  socket.on('pm', function(userTo, privateMessage){
    console.log(socket.username)
    console.log(userTo)
    console.log('--------------------')
    console.log(privateMessage)

    var prvMsgDataObject = {}
        prvMsgDataObject.recipients = []
        prvMsgDataObject.chatHistory = []

    prvMsgDataObject.chatHistory.push({
      timestamp: Date.now(),
      recipient: userTo,
      sender: socket.username,
      content: privateMessage
    })

    prvMsgDataObject.recipients.push(userTo, socket.username);

    PrivateMessageModel.create(prvMsgDataObject, function(err, Messages){
      // console.log('------------------THis is messages-----------------')
      // console.log(Messages)
      // console.log('---------------- This is messages-------------------')
    })
    io.sockets.connected[onlineClients[userTo]].emit('updatePrivateChat', socket.username, userTo, privateMessage)
    io.sockets.connected[onlineClients[socket.username]].emit('updatePrivateChat', socket.username, userTo, privateMessage)
  })


   socket.on('chatAccepted', function(sender, reciepant){
      var UsersInPoemRoom = {
        user1: sender,
        user2: reciepant
      }
      io.sockets.connected[onlineClients[sender]].emit('EnterThePoemRoom', 'this worked yo', UsersInPoemRoom)
      io.sockets.connected[onlineClients[reciepant]].emit('EnterThePoemRoom', 'this worked yo', UsersInPoemRoom)
    })


   socket.on('poeming', function(userOnePoem, users, userTwoPoem, finalPoem){

    console.log(userOnePoem, 'userone poem')
    console.log(userTwoPoem, 'usertwo poem')
    console.log(finalPoem, 'final poem')
    console.log('---------------------------------------this is poemingggn')
    console.log(users)

    var sender = users.user1;
    var recipient = users.user2;
    io.sockets.connected[onlineClients[sender]].emit('updatePoem', userOnePoem, userTwoPoem, finalPoem)
    io.sockets.connected[onlineClients[recipient]].emit('updatePoem', userOnePoem, userTwoPoem, finalPoem)
   })


   socket.on('timer', function(timerUser, timer){
    console.log(timerUser)
    var reciepant = timerUser;
    console.log('-------------this is timer socket boyyyyyy ')
    console.log(timer)
    io.sockets.connected[onlineClients[reciepant]].emit('timerStart', timer)
   })

    socket.on('error', function(error){
      console.log(error)
    })

})// end of socket connection




server.listen(8080, function(){
  console.log('The server is listening on port 8080')
})

