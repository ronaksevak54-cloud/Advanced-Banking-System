const mongoose = require("mongoose");
const Ledger = require("../models/ledgermodel");
const User=require("../models/model");
const accountSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    index: true,
    required: [true, "Account owner is required"],
  },
  status: {
    type: String,
    enum: {
      values: ["Active", "Frozen", "Inactive"],
      message: "Status can only be Active, Frozen or Inactive",
    },
    immutable: true,
    default: "Active",
  },
  currency: {
    type: String,
    required: [true, "Currency is required"],
    default: "INR",
  },
  createdAt: {
    type: Date,
    required: [true, "Creation date of Account is required"],
    default: Date.now,
  },
});
accountSchema.index({ user: 1, status: 1 });
accountSchema.methods.getbalance = async function () {
  const balance = await Ledger.aggregate([
    { $match: { account: this._id } },
    {
      $group: {
        _id: null,
        totalCredit: {
          $sum: { $cond: [{ $eq: ["$type", "Credit"] }, "$amount", 0] },
        },
        totalDebit: {
          $sum: { $cond: [{ $eq: ["$type", "Debit"] }, "$amount", 0] },
        },
      },
    },
    {
      $project: {
        _id: 0,
        balance: { $subtract: ["$totalCredit", "$totalDebit"] },
      },
    },
  ]);
  return balance.length > 0 ? balance[0].balance : 0;
};
module.exports = mongoose.model("Account", accountSchema);
