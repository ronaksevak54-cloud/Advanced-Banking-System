const Account = require("../models/accountmodel");
const createAccount = async (req, res) => {
  try {
    const userId = req.userId;
    const account = new Account({
      user: userId,
    });
    const savedAccount = await account.save();
    res.status(201).json(savedAccount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getUserAccount = async (req, res) => {
  try{
    const userId = req.userId;
    const account = await Account.findOne({ user: userId });
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }
    res.status(200).json(account);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getUserBalance = async (req, res) => {
  try{
    const {accountId}=req.params
    const account=await Account.findOne({_id:accountId, user: req.userId})
    if(!account){
      return res.status(404).json({message:"Account not found"})
    }
    const balance = await account.getbalance();
    res.status(200).json({balance,account:account._id})
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = { createAccount, getUserAccount, getUserBalance};
