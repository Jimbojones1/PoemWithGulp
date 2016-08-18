require('dotenv').config();
 var express = require('express'),
    app      = express(),
    server   = require('http').createServer(app),
    io       = require('socket.io').listen(server),
    router   = express.Router(),
    bodyParser = require('body-parser'),
    cors       = require('cors'),
    browserSync = require('browser-sync')
    path = require('path'),
    session = require("express-session")({
    secret: "my-secret",
    resave: true,
    saveUninitialized: true
  }),
  sharedsession = require("express-socket.io-session");


app.use(session);


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}))


// Requiring Database
require('./db/db')

// Requiring Models
var PrivateMessageModel = require('./models/PrivateMessageModel')
var UserModel           = require('./models/UserModel')


//Require Controllers
var UsersController = require('./controllers/UsersController')

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



app.use('/user/', UsersController)


// Socket Server Code

var onlineClients = {},
    usernames     = {};
io.use(sharedsession(session));

io.sockets.on('connect', function(socket){



  socket.on('disconnect', function(){
    delete usernames[socket.username]
    io.sockets.emit('updateUsers', Object.keys(usernames))
  })


  socket.on('adduser', function(username){
    console.log(socket.handshake.session)
    console.log(username.username)
    socket.handshake.session.username = username.username;
    socket.handshake.session.isLoggedIn = false;
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
    // if (userOnePoem === '<br>' || userTwoPoem === '<br>'){

    // }

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

   socket.on('whosTurn', function(turnNumber, clickedStart, timerUser, socketFrom){
    console.log(timerUser, 'this is timeUser', turnNumber, 'turn number', clickedStart, 'clickedStart', socketFrom, 'socket From here')
    var whosTurn = timerUser.user.user1 === socketFrom ? timerUser.user.user2 : timerUser.user.user1;
    var reciepant = socketFrom === timerUser.user.user1 ? timerUser.user.user1 : timerUser.user.user2;
    console.log(reciepant, whosTurn)
        if(turnNumber === 0 && clickedStart === true){
          console.log('if is hitting ')
            io.sockets.connected[onlineClients[reciepant]].emit('whosTurn', true, reciepant)
            io.sockets.connected[onlineClients[whosTurn]].emit('whosTurn', false, reciepant)
          }

          else if(turnNumber === 1 && clickedStart === false){
           io.sockets.connected[onlineClients[whosTurn]].emit('whosTurn', false, reciepant)
           io.sockets.connected[onlineClients[reciepant]].emit('whosTurn', true, reciepant)
          }
          else if(turnNumber === 1 && clickedStart === true){
            io.sockets.connected[onlineClients[whosTurn]].emit('whosTurn', true, reciepant)
            io.sockets.connected[onlineClients[reciepant]].emit('whosTurn', false, reciepant)
          }
          else if(turnNumber === 2 && clickedStart === false){
           io.sockets.connected[onlineClients[whosTurn]].emit('whosTurn', true, whosTurn)
           io.sockets.connected[onlineClients[reciepant]].emit('whosTurn', false, whosTurn)
          }
          else if(turnNumber === 2 && clickedStart === true){
            io.sockets.connected[onlineClients[whosTurn]].emit('whosTurn', false, reciepant)
            io.sockets.connected[onlineClients[reciepant]].emit('whosTurn', true, reciepant)
          }
          else if(turnNumber === 3 && clickedStart === false){
           io.sockets.connected[onlineClients[whosTurn]].emit('whosTurn', false, reciepant)
           io.sockets.connected[onlineClients[reciepant]].emit('whosTurn', true, reciepant)
          }
          else if(turnNumber === 3 && clickedStart === true){
            io.sockets.connected[onlineClients[whosTurn]].emit('whosTurn', true, reciepant)
            io.sockets.connected[onlineClients[reciepant]].emit('whosTurn', false, reciepant)
          }
        else {
          io.sockets.connected[onlineClients[whosTurn]].emit('whosTurn', false, 'Poeming over')
          io.sockets.connected[onlineClients[reciepant]].emit('whosTurn', false, 'Poeming over')
        }
   })







    socket.on('savePoem', function(poem){

      if (!socket.handshake.session.isLoggedIn){
        socket.emit('login', 'please login to save')
      }
      else{
        socket.emit('saved', 'the element was saved')
      }


    })

    socket.on('error', function(error){
      console.log(error)
    })

})// end of socket connection




server.listen(3000, function(){
  console.log('Server is listening on port 3000')
})


// function listening () {
//   browserSync({
//     proxy: 'localhost:' + 3000,
//     files: ['public/**/*.{js,css}']
//   });
// }
