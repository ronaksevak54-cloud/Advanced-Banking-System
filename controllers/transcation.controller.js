const Account = require("../models/accountmodel");
const Transaction = require("../models/transcationmodel");
const Ledger = require("../models/ledgermodel");
const User = require("../models/model");
const mongoose = require("mongoose");
const {sendTransactionEmail}= require("../services/emailServices");
const completeTransaction = async (req, res) => {
  const { toAccount, fromAccount, amount, idempotencyKey } = req.body;
  if (!toAccount || !fromAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message: "toAccount, fromAccount, amount and idempotencyKey are required",
    });
  }
  if (
    !mongoose.isObjectIdOrHexString(toAccount) ||
    !mongoose.isObjectIdOrHexString(fromAccount)
  ) {
    return res.status(400).json({
      message: "toAccount and fromAccount must be valid MongoDB ObjectIds",
    });
  }
  const existingAccount = await Account.findOne({ _id: toAccount });
  if (!existingAccount) {
    return res.status(404).json({ message: "To Account not found" });
  }
  if (existingAccount.status === "Inactive") {
    return res.status(400).json({ message: "To Account is not active" });
  }
  if (existingAccount.status === "Frozen") {
    return res.status(400).json({ message: "To Account is frozen" });
  }
  const recipient = await User.findById(existingAccount.user);
  if (!recipient) {
    return res.status(404).json({ message: "To Account user not found" });
  }
  const existingFromAccount = await Account.findOne({ _id: fromAccount });
  if (!existingFromAccount) {
    return res.status(404).json({ message: "From Account not found" });
  }
  if (existingFromAccount.status === "Inactive") {
    return res.status(400).json({ message: "From Account is not active" });
  }
  if (existingFromAccount.status === "Frozen") {
    return res.status(400).json({ message: "From Account is frozen" });
  }
  const existingTransaction = await Transaction.findOne({ idempotencyKey });
  if (existingTransaction) {
    if (existingTransaction.status === "Completed") {
      return res.status(200).json({
        message: "Transaction is already completed",
        existingTransaction,
      });
    }
  }
  if (existingTransaction) {
    if (existingTransaction.status === "Pending") {
      return res.status(200).json({ message: "Transaction is in progress" });
    }
  }
  if (existingTransaction) {
    if (existingTransaction.status === "Failed") {
      return res.status(200).json({ message: "Transaction has failed" });
    }
  }
  if (existingTransaction) {
    if (existingTransaction.status === "Reversed") {
      return res.status(200).json({ message: "Transaction has been reversed" });
    }
  }
  const balance = await existingFromAccount.getbalance();
  if (balance < amount) {
    return res
      .status(400)
      .json({
        message: `Insufficient balance your current balance ${balance} is less than your amount ${amount}`,
      });
  }
  const session = await mongoose.startSession();
  try {
      const transaction = new Transaction({
        toAccount,
        fromAccount,
        status: "Pending",
        amount,
        idempotencyKey,
      });
      const debitLedgerentry = new Ledger({
        account: fromAccount,
        amount,
        transaction: transaction._id,
        type: "Debit",
      });
      const creditLedgerentry = new Ledger({
        account: toAccount,
        amount,
        transaction: transaction._id,
        type: "Credit",
      });
      transaction.status = "Completed";
      await transaction.save({ session });
      await debitLedgerentry.save({ session });
      await creditLedgerentry.save({ session });
      await session.endSession();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
  try {
    await sendTransactionEmail(
      recipient.email,
      recipient.name,
      amount,
      toAccount,
      fromAccount
    );
    return res.status(200).json({ message: "Transaction completed successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
const Addtranscation=async(req,res)=>{
  const{toAccount,amount,idempotencyKey}=req.body
  if(!toAccount||!amount||!idempotencyKey){
    return res.status(404).json({message:"toAccount,amount and idempotencyKey are required"})
  }
  const duplicateIdempotencyKey=await Transaction.findOne({idempotencyKey})
  if(duplicateIdempotencyKey){
    return res.status(400).json({message:"Idempotency key already exists use a new one"})
  }
  const toAccountExist=await Account.findOne({_id:toAccount})
  if(!toAccountExist){
    return res.status(404).json({message:"To Account not found"})
  }
  const fromAccountExist=await Account.findOne({user:req.userId })
  if(!fromAccountExist){
    return res.status(404).json({message:"System user Account not found"})
  }
  const session = await mongoose.startSession();
  try{
      const transcation = new Transaction({
        toAccount,
        fromAccount: fromAccountExist._id,
        status: "Pending",
        amount,
        idempotencyKey,
      });
      const debitLedgerentry = new Ledger({
        account: fromAccountExist._id,
        amount,
        transaction: transcation._id,
        type: "Debit",
      });
      const creditLedgerentry = new Ledger({
        account: toAccount,
        amount,
        transaction: transcation._id,
        type: "Credit",
      });
      transcation.status = "Completed";
      await transcation.save({ session });
      await debitLedgerentry.save({ session });
      await creditLedgerentry.save({ session });
      await session.endSession()
    return res.status(200).json({message:"Amount added successfully"});
  }
  catch(error){
    return res.status(500).json({message:error.message});
  }
}
module.exports={completeTransaction,Addtranscation}
