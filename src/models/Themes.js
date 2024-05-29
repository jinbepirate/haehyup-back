const mongoose = require('mongoose');

const themeSchema = new mongoose.Schema({
  _id:{type:mongoose.Schema.Types.ObjectId,required:true},
  themeName: {type:String, required:true},
  description: {type:String, required:true},
  imageUrl: {type:String, required:true},
  musicUrl: {type:String, required:true},
  
});




const Theme = mongoose.model('Theme', themeSchema);
module.exports = Theme;