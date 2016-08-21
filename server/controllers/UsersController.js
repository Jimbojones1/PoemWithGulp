var express = require('express');
var router = express.Router();


router.post('/', function(req, res, next){
  console.log('--------------------------------')
  console.log(req.body)
  console.log(req.session)
  req.session.isLoggedIn = true;
  req.session.save(function(err){
    console.log(err)
  })
  console.log('--------------------------------')
  console.log(req.session)
  res.send("you're in beautiful")
})

router.post('/registration', function(req, res, next){

  console.log(req.body)
  req.session.isLoggedIn = true;

  console.log(req.session)
  res.send("Thankyou, you have successfully registered.")

})





module.exports = router;
