const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const Blacklisted = require("../models/blacklisted.model");
dotenv.config();
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token =
    req.cookies?.token ||
    (authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null);
  if (!token) {
    return res.status(401).json({ error: "Access Denied" });
  }
  const blacklistedToken = await Blacklisted.findOne({ token });
  if (blacklistedToken) {
    return res.status(401).json({ error: "Token is blacklisted" });
  }
  jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
    if (err) {
      return res.status(401).json({ message: err.message });
    }
    req.userId = payload.id;
    next();
  });
};
module.exports = authMiddleware;
