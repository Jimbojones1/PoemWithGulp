var express = require('express');
var bcrypt  = require('bcrypt');
var User = require(__dirname + '/../models/UserModel')
var router = express.Router();


router.post('/', function(req, res, next){
  console.log('--------------------------------')
  console.log(req.body)

  User.findOne({username: req.body.username}, function(err, user){

    if(err){
      console.log('couldn"t find a userr mongoose error')
      res.send('Database error')
    }
    else if(user){
         bcrypt.compare(req.body.password, user.password, function(err, result) {
            // result == true
            if(err){
              console.log('error in bcrypt compare')
              res.send('Database error')
            }
            else if(result){
              console.log('true happened in bcrypt compare')
              req.session.isLoggedIn = true;
              res.send("you're in beautiful")
            }
            else{
              console.log('wrong password hit')
              res.send('Wrong password')
            }
        });
    }
    else {
      res.send('couldn"t find a user with that name')
    }
  })



  console.log(req.session)
  console.log('--------------------------------')
  console.log(req.session)
  // res.send("you're in beautiful")
})

router.post('/registration', function(req, res, next){

  console.log(req.body)
      if(req.body.password === '' || req.body.passwordTwo === '' ||  req.body.username === ''){
        res.send('All fields must be completed')
      }
      else if(req.body.password != req.body.passwordTwo){
        res.send('passwords don"t match')
      }
      else {
          User.findOne({username: req.body.username}, function(err, user){
          if(err || user){
            res.send('That username is already taken')
          }
          else{
            bcrypt.hash(req.body.password, 10, function(err, hash) {
              // Store hash in your password DB.
              User.create({
                username: req.body.username,
                password: hash
              }, function(err, user){
                if(err){
                  res.send('Database error')
                }
                else{
                  console.log(user)
                  req.session.isLoggedIn = true;
                  req.session.username   = user.username;
                  req.session.userId = user._id
                  res.send("Thankyou, you have successfully registered.")
                }
              })
            });
          }
        })
      }
      console.log(req.session)
})





module.exports = router;
