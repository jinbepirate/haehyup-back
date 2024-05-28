const mongoose = require('mongoose');
const { validate } = require('./User');

const memoSchema = new mongoose.Schema({
  title: {type:String, required:true},
  contents: {type:String, required:true},
  // TODO: author 필드를 User 스키마와 연결합니다. 왜 초록색이 나오는지 이해해보세요.
  author: {type:mongoose.Schema.Types.ObjectId, required:true, ref: 'User'},
}, {
  timestamps: true
});

memoSchema.set('toJSON', {virtuals: true});
memoSchema.set('toObject', {virtuals: true});
memoSchema.virtual('User', {
  ref: 'User',
  localField: '_id',
  foreignField: 'memo',
});

const Memo = mongoose.model('Memo', memoSchema);
module.exports = Memo;