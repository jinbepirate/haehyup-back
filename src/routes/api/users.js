const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const auth = require('../../util/auth');

// 회원가입 API
router.post('/signup', async (req, res, next) => {
  try {
    const { uid, password } = req.body;
    console.log(req.body);
    const user = await User.signUp(uid, password);
    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(400);
    next(err);
  }
});

// 로그인 API
router.post('/login', async (req, res, next) => {
  try {
    const { uid, password } = req.body;
    const user = await User.login(uid, password);
    const tokenMaxAge = 60 * 60 * 24 * 3;
    const token = auth.createToken(user, tokenMaxAge);

    user.token = token;

    res.cookie("authToken", token, {
      httpOnly: true,
      maxAge: tokenMaxAge * 1000,
      secure: true, // HTTPS 사용 시 true
      sameSite: 'none' // 크로스 도메인 요청 허용
    });
    
    console.log(user);
    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(400);
    next(err);
  }
});

// 로그아웃 API
router.all('/logout', async (req, res, next) => {
  try {
    res.cookie("authToken", "", {
      httpOnly: true,
      expires: new Date(Date.now()),
    });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(400);
    next(err);
  }
});

// 로그인한 사용자의 정보 반환 API
router.get('/me', auth.authenticate, auth.loginRequired, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -__v');
    if (!user) {
      return res.status(404).json({ message: '로그인을 먼저 해주세요.' });
    } 
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: '올바르지 않은 접근입니다.', error: err.message });
  }
});

