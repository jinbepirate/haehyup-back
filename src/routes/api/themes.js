var express = require('express');
var router = express.Router();
const Themes = require('../../models/Themes');

/* GET Themes listing. */
router.get('/', function(req, res, next) {
  res.send('Themes respond with a resource');
});

module.exports = router;