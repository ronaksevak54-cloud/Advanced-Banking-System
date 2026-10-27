const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/model");
const Blacklisted = require("../models/blacklisted.model");
dotenv.config();

const SystemMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token =
    req.cookies?.token ||
    (authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null);

  if (!token) {
    return res.status(401).json({ error: "Access Denied" });
  }
  const blacklistedToken = await Blacklisted.findOne({ token });
  if(blacklistedToken){
    return res.status(401).json({ error: "Token is blacklisted" });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select("+systemUser");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (!user.systemUser) {
      return res.status(403).json({ message: "Access Denied" });
    }

    req.userId = user._id;
    next();
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
};

module.exports=SystemMiddleware;
  