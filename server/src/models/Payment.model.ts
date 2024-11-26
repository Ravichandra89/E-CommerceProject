import mongoose, { Schema, Document } from "mongoose";

export interface Payment extends Document {
  userId: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  paymentMethod:
    | "Credit Card"
    | "Debit Card"
    | "UPI"
    | "Net Banking"
    | "Wallet"
    | "COD";
  transactionId: string;
  amount: mongoose.Types.Decimal128;
  status: "Pending" | "Completed" | "Failed" | "Refunded";
  refundDetails?: {
    refundId: string;
    amount: mongoose.Types.Decimal128;
    reason: string;
    refundedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema: Schema<Payment> = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: [
        "Credit Card",
        "Debit Card",
        "UPI",
        "Net Banking",
        "Wallet",
        "COD",
      ],
      required: true,
    },
    transactionId: {
      type: String,
      unique: true,
      required: true,
    },
    amount: {
      type: mongoose.Types.Decimal128,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Completed", "Failed", "Refunded"],
      default: "Pending",
    },
    refundDetails: {
      refundId: { type: String, unique: true },
      amount: { type: mongoose.Types.Decimal128 },
      reason: { type: String },
      refundedAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

const PaymentModel =
  mongoose.models.Payment || mongoose.model<Payment>("Payment", paymentSchema);

export default PaymentModel;
