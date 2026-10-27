const express = require("express");
const expressValidator = require("express-validator");
const authMiddleware = require("../middleware/userMiddleware");
const { body } = expressValidator;
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/Controller");
const logoutcontroller=require("../controllers/blacklistentoken.controller");
router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Invalid email address"),
    body("password")
      .isLength({ min: 5 })
      .withMessage("Password must be at least 5 characters long"),
  ],
  registerUser,
  authMiddleware,
);
router.post("/login", loginUser, authMiddleware);
router.post("/logout",logoutcontroller)
module.exports = router;
