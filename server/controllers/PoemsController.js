var express = require('express');
var router = express.Router();



router.post('/', function(req, res, next){
  console.log(req.body);
  console.log(req.session)
  res.send('saved')
})

















module.exports = router;
