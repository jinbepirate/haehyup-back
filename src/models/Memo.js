const mongoose = require('mongoose');


const memoSchema = new mongoose.Schema({
  // title: {type:String, required:true}, 제목 필요 없을 듯.
  contents: {type:String, required:true},
  author: {type:mongoose.Schema.Types.ObjectId, required:true, ref: 'User'},
}, {
  timestamps: true
});

// memoSchema.set('toJSON', {virtuals: true});
// memoSchema.set('toObject', {virtuals: true});

//  memoSchema.virtual('User', {
//   ref: 'User',
//   localField: '_id',
//   foreignField: 'memo',
// });

const Memo = mongoose.model('Memo', memoSchema);
module.exports = Memo;