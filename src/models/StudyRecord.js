const mongoose = require('mongoose');
const { validate } = require('./User');

const studyRecordSchema = new mongoose.Schema({
  startTime: {type:String, required:true},
  endTime: {type:String, required:true},
  user: {type:mongoose.Schema.Types.ObjectId, required:true, ref: 'User'},
  theme : {type:mongoose.Schema.Types.ObjectId, required:true, ref:'Themes'},
}, {
  timestamps: true,
});





const Theme = mongoose.model('StudyRecord', studyRecordSchema);
module.exports = Theme;