var React = require('react');
var ReactDOM = require('react-dom')
var io = require('socket.io-client')
var socket = io.connect();

var Container = React.createClass({
    getInitialState: function(){
      return {logged: false, loggedHeader: false, users: [], chatBoxes: [], chatOpen: false, userMessage: '', PrvMsgData: [], room: false, modal: false, user: '', roomUsers: {}}
    },
    componentDidMount: function(){
      var self = this;

      socket.on('updateUsers', function(data){
        var state = self.state;
        state.users = data;
        self.setState(state);
      });

      socket.on('updateChat', function(data, username){
        var state = self.state;
        socket.username = username;
         state.userMessage = data
         self.setState(state)
      })

      socket.on('updatePrivateChat', function(from, userTo, privateMessage){
        console.log(from)
        console.log(userTo)
        console.log(privateMessage)
        var state = self.state;
        if (privateMessage != 'poemWithMeAccepted'){
               state.PrvMsgData.push({
                from: from,
                userTo: userTo,
                privateMessage: privateMessage
              })
           }


        if(self.state.chatBoxes.indexOf(userTo) > -1 && privateMessage != 'poemWithMeAccepted' || self.state.chatBoxes.indexOf(from) > -1 && privateMessage != 'poemWithMeAccepted'){
          state.chatOpen = true;
          self.setState(state);
          console.log(userTo);
          // console.log('if happened----------------------------------------------------------------------------------------------------------------')
        }
        else if(privateMessage != 'poemWithMeAccepted'){
          state.chatOpen = true;
          state.chatBoxes.push(from)
          // console.log(from)
          // console.log('else happened --------------------------------------------------------------------------------------------------------------')
          self.setState(state)
        }

        if(privateMessage === 'Would You like to Poem with Me' && socket.username === userTo ){
          state.modal = true;
          state.user = from;
          self.setState(state);

          // console.log('poeom with me happppend ddafkdjasklfjadsklfjasdklfjasd')
        }
        else if (privateMessage === 'poemWithMeAccepted'){
          // console.log('poemWithMeAccepted-------------------------------------');
        }
        // console.log('-------------------- this is updatePrivateCHat');
        console.log(self.state);
      })


      socket.on('EnterThePoemRoom', function(message, users){
        console.log(message)
        console.log(users)

        var state = self.state;
        state.room = true;
        state.roomUsers = users;
        self.setState(state);
        console.log(self.state);


      })
    },
    getIndex: function(someArray, users){
      return someArray.indexOf(users)
    },
    removeBox: function(user){
       this.setState([this.state.chatBoxes.splice(this.getIndex(this.state.chatBoxes, user), 1)])
    },
    addChatBox: function(username){
      var state = this.state;
      state.chatBoxes.push(username)
      state.chatOpen = !false
      this.setState(state)
    },
    modalClick: function(didClick){
      console.log(didClick)
      var state = this.state
      console.log('----------------modalClick')
      if(didClick){
        state.room = true;
        state.modal = false;
        this.setState(state)

      }
      else{
        state.modal = false;
        this.setState(state)
      }
       console.log(state)
    },
    hasSubmitted: function(submitted){
      if(submitted === 'true'){
        var state     = this.state;
        state.loggedHeader = !false;
        state.logged  = !false;
        this.setState(state)
      }
    },
    render: function(){
      // console.log(this.state)
      // console.log('line 18-----------------------------------------------------------------------------------------------------')
      return (
                  <div>
                    {this.state.room ? <Room roomUsers={this.state.roomUsers} /> : <ChatRoom modalClick={this.modalClick}
                                                            modal={this.state.modal}
                                                            user={this.state.user}
                                                            loggedHeader={this.state.loggedHeader}
                                                            userMessage={this.state.userMessage}
                                                            logged={this.state.logged}
                                                            users={this.state.users}
                                                            chatOpen={this.state.chatOpen}
                                                            addChatBox={this.addChatBox}
                                                            hasSubmittedlogged={this.hasSubmitted}
                                                            PrvMsgData={this.state.PrvMsgData}
                                                            chatBoxes={this.state.chatBoxes}
                                                            removeBox={this.removeBox}
                                                            />
                                                          }

                 </div>
           )
         }
      })


  var ChatRoom = React.createClass({
    render: function(){
      return (
        <div id="ChatRoom">
         <Modal modalClick={this.props.modalClick}
                modal={this.props.modal}
                user={this.props.user}
                />
          {this.props.loggedHeader ? <HeaderContainer/> : null}
          {this.props.userMessage.length > 1 ? <WelcomeContainer userMessage={this.props.userMessage}/> : null}
          {this.props.logged ? <UserList  users={this.props.users}
                                          chatOpen={this.props.chatOpen}
                                          logged={this.props.logged}
                                          addChatBox={this.props.addChatBox}/>
                                          : <Username logged={this.props.hasSubmittedlogged}/>}
          <div id="prvBoxarea" className="container">
            <div className="row">
              {this.props.chatOpen && this.props.logged ? <PrivateMessageBox PrvMsgData={this.props.PrvMsgData}
                                                                             chatBoxes={this.props.chatBoxes}
                                                                             removeBox={this.props.removeBox}/>
                                                                             : null}
            </div>
          </div>
        </div>
        )
    }
  })

  var UserList = React.createClass({
      userClick: function(user){
        this.props.addChatBox(user);
      },
      render: function(){
        var self = this;
        var users = this.props.users.map(function(user, i){
          return (
            <li key={i} onClick={self.userClick.bind(self, user)} value={user}>{user}</li>
            )
        })

        return (
          <div className="container" id="userList">
            <div className="row">
              <div  className="twelve columns">
                <header className="twelve columns UserListHeader"><h5>Poets</h5></header>
                <ul>{users}</ul>
              </div>
            </div>
          </div>

          )
      }
    })



// This is the Parent Component for the Private Message Box
// ##########################################################################
// ##########################################################################

  var PrivateMessageBox = React.createClass({
    removeClick: function(user){
      this.props.removeBox(user);
    },
    render: function(){
      var self = this;
      var userBoxes = this.props.chatBoxes.map(function(user, i){
        return   <div className="PrivateMessageBox four columns" key={i}>
                    <PrivateMessageHeader data={user} removeBox={self.props.removeBox}/>
                    <PrivateMessageArea   PrvMsgData={self.props.PrvMsgData} data={user}/>
                    <PrivateMessageInput  data={user}/>
                 </div>
               })

        return (
           <div>{userBoxes}</div>
          )
        }
     })

  var PrivateMessageHeader = React.createClass({
    render: function(){
      return (
        <header className="top-bar twelve columns">

          <h4 className='prvUserInfo'>{this.props.data}</h4>
          <ul id="chatButtonUl">
            <Feather data={this.props.data} />
            <Minus />
            <PrivateMessageButton removeClick={this.props.removeClick} removeBox={this.props.removeBox} user={this.props.data}/>
          </ul>
        </header>
        )
      }
   })

  var Minus = React.createClass({
    render: function(){
      return (
        <li><i className="fa fa-minus" aria-hidden="true"></i></li>
        )
      }
    })

  var Feather = React.createClass({
    joinRoom: function(){

      var userTo = this.props.data;
      socket.emit('pm', userTo, 'Would You like to Poem with Me')
    },
    render: function(){
      return (
        <li><i className="fa fa-pencil" aria-hidden="true" onClick={this.joinRoom}></i></li>
        )
      }
   })

  var PrivateMessageButton = React.createClass({
    removeClick: function(user){

      this.props.removeBox(user);
    },
    render: function(){
      return (
        <li className='removeButton' onClick={this.removeClick.bind(this, this.props.user)}><i className="fa fa-times" aria-hidden="true"></i></li>
        )
      }
   })

  var PrivateMessageInput = React.createClass({
   getInitialState: function(){
      return {privateMessage: ''}
    },
    componentDidMount: function(){

    },
    handlePrivateMessage: function(event){
      var state = this.state;
      state.privateMessage = event.target.value;
      this.setState(state);
    },
    submitMessage: function(user, event){
      console.log(user)
        if(event.charCode === 13){
        var userTo = user;
        var privateMessage = this.state.privateMessage;
        socket.emit('pm', userTo, privateMessage)

        this.setState({privateMessage: ''})
      }
    },
    render: function(){
      return (
        <input className="prvSend twelve columns" onChange={this.handlePrivateMessage} onKeyPress={this.submitMessage.bind(this, this.props.data)} value={this.state.privateMessage} />
        )
    }
  })


  var PrivateMessageArea = React.createClass({
    sorter: function(data){
      var user = this.props.data;
      if(user === data.userTo){
        return "Sender"
      }
      else{
        return "Reciepient"
      }
    },
    render: function(){
      var user = this.props.data
      var filteredData = this.props.PrvMsgData.filter(function(data, i){
        console.log(data)
        return data.userTo === user || user === data.from
      })

      var self = this;
      // console.log('-------------------------------------filteredData----------------------------------------------------------------------------------')
      // console.log(filteredData)
      // console.log('-----------------------------------------------------------------------------------------------------------------------------------')
      var userData = filteredData.map(function(data, i){
        return (
          <p key={i}><span className={self.sorter(data)}>{data.from}</span>: {data.privateMessage}</p>
          )
      })
      return (
         <div className='PrivateMessage'>
          {userData}
         </div>
        )

    }
  })

// This is the Parent Component for the Private Message Box
// #########################################################################


//  This is the Header Component for the Main Page
// #########################################################################

var HeaderContainer = React.createClass({
  render: function(){
    return (
      <div className="container">
        <div className="row">
          <HeaderElement/>
        </div>
      </div>
    )
  }
})


var HeaderElement = React.createClass({
  render: function(){
    return (
      <header className="twelve columns" id="main-page-header">
        <h1 className="Logo">Logo</h1>
      </header>
    )
  }
})


//  Welcome Container #####################################################
//  #######################################################################


var WelcomeContainer = React.createClass({
  render: function(){
    return (
      <div id="Welcome-Container">
       <p>{this.props.userMessage}</p>
        <blockquote id="quote">"To see a World in a Grain of Sand
          And a Heaven in a Wild Flower,
          Hold Infinity in the palm of your hand
          And Eternity in an hour."
        </blockquote>
        <quote>~William Blake</quote>
      </div>
      )
  3 }
})


// Modal ###############################################################
// #####################################################################
var Modal = React.createClass({
  clickYes: function(){
    socket.emit('chatAccepted', this.props.user, socket.username)
    socket.emit('pm', this.props.user, 'poemWithMeAccepted')
    this.props.modalClick(true)


  },
  clickNo: function(){
    this.props.modalClick(false)
  },
  render: function(){
    return (
      <div id= {this.props.modal ? "dialog" : "dialogClosed"}>
        <div id="button-modal">
          <button onClick={this.clickYes}>PoemWithMe</button>
          <button onClick={this.clickNo}>No Bitch</button>
        </div>
      </div>
    )
  }
})

// POEM WITH ME WINDOW ***********************************
// ***********************************************************
// ***********************************************************

var Room = React.createClass({
  getInitialState: function(){
    return {finalPoem: '', userTextArea: '', userTwo: '', activateTyping: false}
  },
  getUserTextAreaInput: function(userText, userTyping){
    var state = this.state;
    console.log(state)
    var length = userText.length;
    var letter = userText.slice(length - 1, length);
    if(this.props.roomUsers.user1 === userTyping){
      state.userTextArea = letter;
      socket.emit('poeming', this.state.userTwo, this.props.roomUsers, state.userTextArea, this.state.finalPoem)
      this.setState(state)

    }else {
      state.userTwo = letter;

      socket.emit('poeming', state.userTwo, this.props.roomUsers, this.state.userTextArea, this.state.finalPoem)

      this.setState(state)
    }
  },
  allowTyping: function(finished){
    var state = this.state;

    state.activateTyping = true;
    this.setState(state);
  },
  componentDidMount: function(){
    var self = this;
    var state = this.state
    socket.on('updatePoem', function(userOnePoem, userTwoPoem, finalPoem){
      if(userOnePoem.length >= 1){


        state.finalPoem = state.finalPoem + userOnePoem;
        self.setState(state)
      }
      else if(userTwoPoem.length >= 1){

        state.finalPoem = state.finalPoem + userTwoPoem;
        self.setState(state)
      }
      else {
        var length = state.finalPoem.length
        var backspace = state.finalPoem.slice(0, length - 1)
        state.finalPoem = backspace;
        self.setState(state)
      }

    })
  },
  render: function(){
    console.log(this.state, 'this is the room component-----------------------------------------------')
    return (
      <div id="Room">
        <RoomUser user={this.props.roomUsers} poem={this.state.finalPoem} getUserTextAreaInput={this.getUserTextAreaInput} activeTyping={this.state.activateTyping}/>
        <PoemArea poem={this.state.finalPoem} userText={this.state.userTextArea}/>
        <PoemContainer activeTyping={this.state.allowTyping} user={this.props.roomUsers}/>
      </div>
     )
    }
  })


var RoomUser = React.createClass({
  getInitialState: function(){
    return {textAreaValue: '', keyCode: ''}
  },
  keyDown: function(e){
    console.log(e.keyCode)
    var state = this.state;
    state.keyCode = e.keyCode;
    this.setState(state)
  },
  handleTyping: function(event, keycode){
    var user = this.props.user.user1 != socket.username ? this.props.user.user2 : this.props.user.user1;
    var state = this.state;
        state.textAreaValue = event.target.value;
        this.setState(state)
    console.log(this.props.activeTyping, '----------------------------------this.props.activeTyping')
    if(this.props.activeTyping === true){

        if(state.keyCode === 8){
        this.props.getUserTextAreaInput('', user)
      }
       else {
         this.props.getUserTextAreaInput(event.target.value, user)
        }
    }
  },
  render: function(){
    return (
      <div id="RoomUser">
        {this.props.user.user1 != socket.username ? <h4>{this.props.user.user2}</h4> : <h4>{this.props.user.user1}</h4>}
        <textarea type="text" placeholder="Username Biotch" onChange={this.handleTyping} onKeyDown={this.keyDown} value={this.state.textAreaValue}/>
      </div>
      )
    }
  })


var PoemArea = React.createClass({
  render: function(){
    return (
      <div id="PoemArea">
          <h4>This is the Poem Area </h4>
          <p id="poemsArea">{this.props.poem}</p>
      </div>
      )
    }
  })

var PoemContainer = React.createClass({
  render: function(){
    return (
      <div id="peomContainer">
        <p>This is poem container</p>
        <Timer activateTyping={this.props.allowTyping} user={this.props.user}/>
      </div>
      )
    }
  })


var Timer = React.createClass({
  getInitialState: function(){
    return {time: 10, goTime: false, countdown: 3, turns: 0, personWhoClickedStart: false}
  },
  handleClick: function(){
    // set the interval for timer here
    var state = this.state;
    var timerUser = this.props.user.user1 === socket.username ? this.props.user.user2 : this.props.user.user1;
    socket.emit('timer', timerUser, true);
    this.timer = setInterval(this.tick, 1000)
    state.personWhoClickedStart = true;
    this.setState(state);
  },
  componentDidMount: function(){
    var state = this.state;
    var self = this;
    socket.on('timerStart', function(timer){
      state.goTime = timer;
      clearInterval(self.timer)
      clearInterval(self.countdown)
      self.timer = setInterval(self.tick, 1000)
      self.setState(state)
    })

  },
  checkGameOver: function(){
    var state = this.state;
    if(state.turns === 4){
       clearInterval(this.timer)
       clearInterval(this.countdown)
       console.log('game overrrrrr')
    }

  },
  checkWhosTurn: function(){
    var state = this.state;

    if(state.personWhoClickedStart === true && state.turns === 0){
      this.props.activateTyping(true);

    }

  },
  checkTime: function(){
    var state = this.state;
    var previousTurn = this.state.lastTurn;
     if(state.goTime === true){

           if (state.time > 0){
            state.time--;
            this.setState(state)
          }
          else if (state.time === 0){
             console.log('else if in check time is hittinggggggggggggggggg')
             clearInterval(this.timer)
             clearInterval(this.countdown)
             state.time = 10;
             state.turns++;
             this.checkWhosTurn();
             this.countdown = setInterval(this.countDownTick, 1000)
            // this.props.activateTyping(true)
            this.setState(state);
            this.checkGameOver();
          }
          else {
            return null;
          }
       }
  },
  checkCountdown: function(){
    var state = this.state;
    var timerUser = this.props.user.user1 === socket.username ? this.props.user.user2 : this.props.user.user1;

    if (state.countdown === 0){
        console.log('if hitttt')
        clearInterval(this.countdown)
        clearInterval(this.timer)
        state.countdown = 3;
        this.setState(state);
        console.log(timerUser)
        this.timer = setInterval(this.tick, 1000)
     }
  },
  countDownTick: function(){
    var state = this.state;
        state.countdown--;
        this.setState(state)
        this.checkCountdown();
  },
  tick: function(){
    var state = this.state;
        state.goTime = true;
        this.setState(state);
        this.checkTime();
    // calling setState causes the component to be re-rendered
  },
  render: function(){
    console.log(this.state);
    console.log('timer --------------------------------------')
    return (
      <div>
        <button id="submit" onClick={this.handleClick}>Start</button>
        <p> {this.state.time + ' seconds left'}</p>
        <p>{this.state.countdown + ' seconds player 2 ready'}</p>
      </div>
      )
  }
})






// var ModalButtons = React.createClass({
//   render: function(){
//     return (



//     )
//   }
// })
// Login information for when a user connects
// #####################################################################


  var Username = React.createClass({
      getInitialState: function(){
        return {username: ''}
      },
      handleNameChange: function(event){
        var state = this.state;
        state.username = event.target.value;
        this.setState(state)
      },
      handleSubmit: function(e){
        e.preventDefault()
        var state = this.state;
        //emit the username to the server
        socket.emit('adduser', state)
        state.username  = '';

        this.props.logged('true')
        // this.setState(state)
      },
      render: function(){
        return (
          <form className='username' onSubmit={this.handleSubmit}>
            <div class='row'>
              <div class='twelve columns'>
                <input type="text" placeholder="Username Biotch" onChange={this.handleNameChange} value={this.state.username}/>
              </div>
            </div>
          </form>
          )
         }
      })




ReactDOM.render(<Container />, document.getElementById('container'))








































