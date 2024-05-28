const jwt = require("jsonwebtoken");

function createToken(visibleUser, maxAge=60*60*24*3) {
  return jwt.sign(visibleUser, process.env.JWT_SECRET || "MyJWT",{ 
    expiresIn:maxAge
  });
}

function verifyToken(token) {
  if (!token) {
    return null;
  }
  const verifiedToken = jwt.verify(token, process.env.JWT_SECRET || "MyJWT");
  return verifiedToken;
}

async function authenticate(req, res, next) {
  // Cookie에 있는 authToken을 가져오거나,
  let token = req.cookies.authToken;
  // Header의 Authorization에 있는 Bearer token을 가져옵니다.
  let headerToken = req.headers.authorization;
  if (!token && headerToken) {
    token = headerToken.split(" ")[1];
  }

  // token이 없으면 인증 실패
  const user = verifyToken(token);
  req.user = user; // req.user에 user 정보를 넣어줍니다.

  if (!user) {
    const error = new Error("인증 실패");
    error.status = 403;

    next(error);
  }
  next();
}

async function loginRequired(req, res, next) {
  if (!req.user) {
    const error = new Error("로그인이 필요합니다.");
    error.status = 403;
    next(error);
  }
  next();
}

module.exports = { createToken, verifyToken, authenticate, loginRequired};

