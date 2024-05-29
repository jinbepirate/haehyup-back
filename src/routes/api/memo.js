const express = require('express');
const router = express.Router();
const Memo = require('../../models/Memo');
const auth = require('../../util/auth');

// Memo 작성 API
router.post('/write', auth.authenticate, auth.loginRequired, async (req, res) => {
  try {
    const memo = await Memo.create({
      contents: req.body.contents,
      author: req.user._id,
    });
    res.status(201).json(memo);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: '정상적인 값을 넣어주세요', error: err.message });
  }
});

// Memo 수정 API ( memo의 id를 쿼리 파라미터로 받음 (_id가 아님!!))
router.put('/update/:id', auth.authenticate, auth.loginRequired, async (req, res) => {
  try {
    const memo = await Memo.findById(req.params.id);

    if (!memo) {
      return res.status(404).json({ message: '작성하신 메모가 없습니다.' });
    }

    // 로그인한 사용자가 작성한 메모인지 확인
    if (memo.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '정상적인 접근이 아닙니다.' });
    }

    // 메모 수정
    memo.contents = req.body.contents || memo.contents;
    await memo.save();

    res.status(200).json(memo);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: '정상적인 접근이 아닙니다.', error: err.message });
  }
});

// Memo 삭제 API ( memo의 id를 쿼리 파라미터로 받음 (_id가 아님!!))
router.delete('/delete/:id', auth.authenticate, auth.loginRequired, async (req, res) => {
  try {
    const memo = await Memo.findById(req.params.id);

    if (!memo) {
      return res.status(404).json({ message: '메모가 존재하지 않습니다.' });
    }

    // 로그인한 사용자가 작성한 메모인지 확인
    if (memo.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '정상적인 접근이 아닙니다.' });
    }

    // 메모 삭제
    await Memo.deleteOne({_id : req.params.id});

    res.status(200).json({ message: '메모가 삭제 되었습니다.' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: '정상적인 접근이 아닙니다.', error: err.message });
  }
});

// 단일 메모 조회 API ( memo의 id임 )
router.get('/read/:id', auth.authenticate, auth.loginRequired, async (req, res) => {
  try {
    const memo = await Memo.findById(req.params.id);

    if (!memo) {
      return res.status(404).json({ message: '메모가 존재하지 않습니다.' });
    }

    res.status(200).json(memo);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: '정상적이지 않은 접근입니다.', error: err.message });
  }
});

// 특정 사용자가 작성한 모든 메모 조회 API
router.get('/readall/:userId', auth.authenticate, auth.loginRequired, async (req, res) => {
  try {
    const memos = await Memo.find({ author: req.params.userId });

    if (memos.length === 0) {
      return res.status(404).json({ message: '작성하신 메모가 없습니다.' });
    }

    res.status(200).json(memos);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: '비 정상적인 접근입니다.', error: err.message });
  }
});

module.exports = router;
