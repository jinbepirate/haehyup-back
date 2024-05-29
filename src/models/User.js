const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    uid: {
        type: String,
        required: [true, "아이디를 입력해 주세요."],
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, "비밀 번호를 입력해 주세요."],
    },
    userImgId: {
        type: String,
        required: true
    }
});

userSchema.statics.signUp = async function(uid, password) {
    const salt = await bcrypt.genSalt(); // 비밀번호에 salt 첨가
    const randomImgId = Math.floor(Math.random() * 5) + 1; // 1부터 5까지의 랜덤한 숫자 생성

    try {
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await this.create({ uid, password: hashedPassword, userImgId: randomImgId.toString() });
        return {
            _id: user._id,
            uid: user.uid,
            userImgId: user.userImgId
        };
    } catch (err) {
        throw err;
    }
};

userSchema.statics.login = async function(uid, password) {
    const user = await this.findOne({ uid });
    if (user) {
        const auth = await bcrypt.compare(password, user.password);
        if (auth) {
            // 로그인할 때마다 랜덤한 프로필 이미지 ID 갱신
            const randomImgId = Math.floor(Math.random() * 5) + 1;
            user.userImgId = randomImgId.toString();
            await user.save();
            return {
                _id: user._id,
                uid: user.uid,
                userImgId: user.userImgId
            };
        }
        throw Error("incorrect password");
    }
    throw Error("incorrect uid");
};

const User = mongoose.model("user", userSchema);

module.exports = User;
