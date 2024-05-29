var express = require('express');
var router = express.Router();
const StudyRecord = require('../../models/StudyRecord');
const auth = require('../../util/auth');

/* POST when user come in a Room. */
router.post('/', auth.authenticate, auth.loginRequired, async function(req, res, next) {
  try {
    const {theme} = req.body;
    await StudyRecord.createStudyRecord(req.user._id, theme);
    res.status(201).send("Success to create a StudyRecord.");
  } catch (err) {
    console.error(err);
    res.status(400);
    next(err);
  }
});

/* PUT when user get out Room */
router.put('/', auth.authenticate, auth.loginRequired, async function(req, res, next) {
  try {
    const {theme} = req.body;
    await StudyRecord.updateStudyRecord(req.user._id, theme);
    res.status(200).send("Success to update a StudyRecord.");
  } catch (err) {
    console.error(err);
    res.status(400);
    next(err);
  }
});

module.exports = router;