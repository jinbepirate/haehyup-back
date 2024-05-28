const mongoose = require('mongoose');

const themeSchema = new mongoose.Schema({
  themeName: {type:String, required:true},
  description: {type:String, required:true},
  imageUrl: {type:String, required:true},
  backgroundUrl: {type:String, required:true},
  musicUrl: {type:String, required:true}
});

themeSchema.set('toJSON', {virtuals: true});
themeSchema.set('toObject', {virtuals: true});


const Theme = mongoose.model('Theme', themeSchema);
module.exports = Theme;