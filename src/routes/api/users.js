var express = require('express');
var router = express.Router();
const User = require("../../models/User");
const auth = require('../../util/auth');

module.exports = router;

router.post("/signup", async (req, res, next) => {
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

  
router.post("/login", async (req, res, next) => {
    try {
      const { uid, password } = req.body;
      const user = await User.login(uid, password);
      const tokenMaxAge = 60 * 60 * 24 * 3;
      const token = auth.createToken(user, tokenMaxAge);
      
      user.token = token;
      
      res.cookie("authToken", token, {
        httpOnly: true,
        maxAge: tokenMaxAge * 1000,
      });
      console.log(user);
      res.status(201).json(user);
    } catch (err) {
      console.error(err);
      res.status(400);
      next(err);
    }
  });
  
  router.all("/logout", async (req, res, next) => {
    try {
      //쿠키 삭제
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
  
