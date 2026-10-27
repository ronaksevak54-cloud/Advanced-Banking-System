const express = require("express");
const router = express.Router();
const {createAccount, getUserAccount,getUserBalance} = require("../controllers/accountController");
const authMiddleware = require("../middleware/userMiddleware");
router.post("/create", authMiddleware, createAccount);
router.get("/getUserAccount", authMiddleware, getUserAccount);
router.get("/getUserbalance/:accountId", authMiddleware, getUserBalance);
module.exports = router;
