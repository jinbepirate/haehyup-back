const mongoose = require('mongoose');
const { validate } = require('./User');

const studyRecordSchema = new mongoose.Schema({
  startTime: {type: Date, required: true},
  endTime: {type: Date, required: true},
  user: {type:mongoose.Schema.Types.ObjectId, required:true, ref: 'User'},
  theme : {type:String, required:true},
}, {
  timestamps: true,
});


studyRecordSchema.statics.findByUserAndTheme = async function(userId, theme) {
  return await this.find({ user: userId, theme: theme });
};

studyRecordSchema.statics.findByDate = async function(userId, date) {
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);
  return await this.find({ user: userId, startTime: { $gte: startDate, $lte: endDate } });
};


const studyRecord = mongoose.model('StudyRecord', studyRecordSchema);
module.exports = studyRecord;