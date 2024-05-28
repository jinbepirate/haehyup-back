const mongoose = require('mongoose');
const { isuid } = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    uid: {
        type : String,
        required: [true,"아이디를 입력해 주세요."],
        unique : true,
        lowercase: true,
        validtae: [isuid, "올바른 아이디를 입력해주세요"],
    },
    password:{
        type: String,
        required:[true,"비밀 번호를 입력해 주세요."],
    },
})

userSchema.statics.signUp = async function(uid,password){
    const salt = await bcrypt.genSalt();        //비밀번호에 salt첨가

    try{
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await this.create({uid,password: hashedPassword});
        return{
            _id: user._id,
            uid: user.uid,
        };
    }catch(err){
        throw err;
    }
};

userSchema.statics.login =async function(uid, password) {
    const user = await this.findOne({uid});
    if (user) {
        const auth = await bcrypt.compare(password,user.password);
    if (auth) {
        return user.visibleUser;
    }
    throwError("incorrect password");
    }
    throw Error("incorrect uid");
};

const visibleUser =userSchema.virtual("visibleUser");
visibleUser.get(function (value, virtual, doc) {
return {
    _id: doc._id,
    uid: doc.uid,
    };
});
const User= mongoose.model("user", userSchema);

module.exports = User;

