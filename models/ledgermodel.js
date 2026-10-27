const mongoose = require("mongoose");
const ledgerSchema = new mongoose.Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: [true, "Account is associated with the ledger entry"],
    immutable: true,
  },
  amount: {
    type: Number,
    required: [true, "Amount is required"],
    immutable: true,
  },
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transaction",
    required: [true, "Transaction is associated with the ledger entry"],
    immutable: true,
  },
  type: {
    type: String,
    enum: {
      values: ["Credit", "Debit"],
      message: "Type can only be Credit or Debit",
    },
    required: [true, "Type is required"],
    immutable: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
function preventledgerModification(next) {
  throw new Error("Ledger entries cannot be modified");
}
ledgerSchema.pre("updateOne", preventledgerModification);
ledgerSchema.pre("findOneAndUpdate", preventledgerModification);
ledgerSchema.pre("deleteOne", preventledgerModification);
ledgerSchema.pre("findOneAndDelete", preventledgerModification);
ledgerSchema.pre("deleteMany", preventledgerModification);
ledgerSchema.pre("findOneAndRemove", preventledgerModification);
ledgerSchema.pre("remove", preventledgerModification);
module.exports = mongoose.model("Ledger", ledgerSchema);
