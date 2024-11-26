import mongoose, { Schema, Document } from "mongoose";

export interface User extends Document {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone: string;
  role:
    | "Guest User"
    | "Registered User"
    | "Shop Owner"
    | "Sales Team Member"
    | "Admin";
  passwordResetOTP: number;
  passwordResetOTPExpiration: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema: Schema<User> = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: [
        "Guest User",
        "Registered User",
        "Shop Owner",
        "Sales Team Member",
        "Admin",
      ],
      required: true,
      default: "Guest User",
    },
    passwordResetOTP: {
      type: Number,
    },
    passwordResetOTPExpiration: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const userModel =
  mongoose.models.User || mongoose.model<User>("User", userSchema);

export default userModel;
