var express = require('express');
var router = express.Router();


router.post('/', function(req, res, next){
  console.log('--------------------------------')
  console.log(req.body)
  console.log(req.session)
  console.log('--------------------------------')
  res.send('this worked dude yay your logged in')
})







module.exports = router;
