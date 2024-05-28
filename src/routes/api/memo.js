var express = require('express');
var router = express.Router();
const Memo = require('../../models/Memo');

/* GET Memo listing. */
router.get('/', function(req, res, next) {
  res.send('Themes respond with a resource');
});

module.exports = router;