var express = require('express');
var router = express.Router();
const StudyRecord = require('../../models/StudyRecord');

/* GET StudyRecord listing. */
router.get('/', function(req, res, next) {
  res.send('Themes respond with a resource');
});

module.exports = router;