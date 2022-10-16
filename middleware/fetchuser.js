const jwt = require("jsonwebtoken");
const JWT_SECRET = "@itistopsecrettoken$";

const fetchuser = async(req, res, next) => {
  // get the user from jwt token and add id to req obj
  const token =await req.header("auth-token");
  if (!token) {
 console.log(token)
    res.status(401).send({ error: "Please authenticate using a valid token" });
  }
  else{
 
  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data.user;
    next();
  } catch (error) {
    console.log(token)
    res.status(401).send({ error: "Please authenticate using a valid token2" });
  }
     
}
};

module.exports = fetchuser;
