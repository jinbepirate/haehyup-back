const jwt = require("jsonwebtoken");

function createToken(visibleUser, maxAge = 60 * 60 * 24 * 3) {
    return jwt.sign(visibleUser, process.env.JWT_SECRET || "MyJWT", {
        expiresIn: maxAge,
    });
}
function verifyToken(_token) {
    if (!_token) {
        return null;
    }
const verifiedToken = jwt.verify(_token, process.env.JWT_SECRET || "MyJWT");
    return verifiedToken;
}

async function authenticate(req, res, next) {
    //request 안의 cookie에서 token을 꺼내서 검증함.
    //그 후 req.user한테 설정해줌.
    let token = req.cookies.authToken;

    let headerToken = req.headers.authorization;
    if (!token && headerToken) {
      token = headerToken.split(" ")[1];
    }
    
    const user = verifyToken(token);
    req.user = user;
    next();
   
  }

async function loginRequired(req,res,next){
    if (!req.user) {
        const error = new Error("Authorization Failed");
        error.status = 403;
        next(error);
      }
      next();
}
module.exports = {
    authenticate,
    loginRequired,
    createToken,
    verifyToken,
};