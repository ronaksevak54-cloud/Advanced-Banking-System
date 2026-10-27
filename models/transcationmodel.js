const mongoose = require("mongoose");
const transactionSchema = new mongoose.Schema({
  toAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: [true, "To Account is required"],
    index: true,
  },
  fromAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: [true, "From Account is required"],
    index: true,
  },
  status: {
    type: String,
    enum: {
      values: ["Pending", "Completed", "Failed", "Reversed"],
      message: "Status can only be Pending, Completed, Failed or Reversed",
    },
    default: "Pending",
  },
  amount: {
    type: Number,
    required: [true, "Amount is required"],
    min: [1, "Amount must be greater than 0"],
  },
  idempotencyKey: {
    type: String,
    required: [true, "Idempotency Key is required"],
    index: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.model("Transaction", transactionSchema);
