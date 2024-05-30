var express = require('express');
var router = express.Router();
const StudyRecord = require('../../models/StudyRecord');
const User = require("../../models/User");
const Memo = require('../../models/Memo');
const auth = require('../../util/auth');

/**
 * GET user & studyRecord & memo. 
 * @route GET /myPage
 * @group myPage
 * @returns {object} 200 - user & studyRecord & memo  
 * @returns {Error}  default - Unexpected error
 * @security JWT
 * @example response - 200 - user & studyRecord & memo
 * {
 *   "user": {
 *     "uname": "nick-name",
 *     "profileImage": "image",
 *     "email": "email@dfkdgn.com"
 *   },
 *   "themeRecord": {
 *     "forest": 3,
 *     "rain": 43,
 *     "sea": 149,
 *   },
 *   "studyRecord": {
 *     "studyDate": ['2024-05-20', '2024-05-21', '2024-05-22', '2024-05-23', '2024-05-24', '2024-05-25', '2024-05-26', '2024-05-27', '2024-05-28', '2024-05-29'],
 *     "studyTime": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
 *   }
 * }
 * */

router.get('/', auth.authenticate, auth.loginRequired, async (req, res, next) => {
  const token = req.cookies.authToken;
  try {
    // user 정보
    const user = await User.findById(req.user._id);
    const userObj = {
      uname: user.uid,
      userImgId : user.userImgId
    };
    // themeRecord 정보
    const themeRecord = {};
    for (let theme of ['forest', 'rain', 'sea']) {
      const themeRecords = await StudyRecord.findByUserAndTheme(req.user._id, theme);
      const sumTime = 0;
      for (let themeRecord of themeRecords) {
        sumTime += (themeRecord.endTime.getTime() - themeRecord.startTime.getTime()) / 60;
      }
      themeRecord[theme] = sumTime;
    }
    // studyRecord
    const dateRecord = {};
    // 오늘 날짜와 최근 10일 Date 뽑아서 studyRecord db에서 찾고 시간 더하기
    const today = new Date();
    const recentDates = [];
    for (let i = 0; i < 10; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      recentDates.push(date.toISOString().split('T')[0]);
    }

    const dates = [];
    const studyTimes = [];
    for (let date of recentDates) {
      const dateRecords = await StudyRecord.findByDate(req.user._id, date);
      let totalStudyTime = 0;
      for (let record of dateRecords) {
        const startTime = new Date(record.startTime);
        const endTime = new Date(record.endTime);
        totalStudyTime += (endTime.getTime() - startTime.getTime()) / (1000 * 60);
      }
      dates.push(date);
      studyTimes.push(totalStudyTime);
    }
    dateRecord["dates"] = dates;
    dateRecord['studyTime'] = studyTimes;

    res.status(200).json({ user: userObj, themeRecord: themeRecord, dateRecord:dateRecord });
  } catch (err) {
    console.error(err);
    res.status(401);
    next(err);
  } 
});



module.exports = router;