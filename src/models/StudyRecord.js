const mongoose = require('mongoose');
const { validate } = require('./User');

const studyRecordSchema = new mongoose.Schema({
  startTime: {type:String, required:true},
  endTime: {type:String, required:true},
  user: {type:mongoose.Schema.Types.ObjectId, required:true, ref: 'User'},
}, {
  timestamps: true,
});

studyRecordSchema.set('toJSON', {virtuals: true});
studyRecordSchema.set('toObject', {virtuals: true});
studyRecordSchema.virtual('User', {
  ref: 'User',
  localField: '_id',
  foreignField: 'studyRecord',
});

const Theme = mongoose.model('StudyRecord', studyRecordSchema);
module.exports = Theme;