const express=require("express")
const router=express.Router()
const {completeTransaction,Addtranscation}=require("../controllers/transcation.controller")
const authMiddleware=require("../middleware/userMiddleware")
const SystemMiddleware=require("../middleware/system.middleware")
router.post("/transactions",authMiddleware,completeTransaction)
router.post("/addcash",SystemMiddleware,Addtranscation)
module.exports=router
