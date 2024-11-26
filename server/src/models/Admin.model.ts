import mongoose, { Schema, Document, mongo } from "mongoose";

export interface Admin extends Document {
  username: string;
  email: string;
  password: string;
  role: "Admin";
  createdAt: Date;
  updatedAt: Date;
  permission: {
    manageUser: boolean;
    manageOrders: boolean;
    manageProducts: boolean;
    manageCategory: boolean;
    manageSuppliers: boolean;
    viewAnalytics: boolean;
    managaMarketing: boolean;
  };
}

const adminSchema: Schema<Admin> = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      default: "Admin",
    },
    permission: {
      manageUser: {
        type: Boolean,
        default: false,
      },
      manageOrders: {
        type: Boolean,
        default: false,
      },
      manageProducts: {
        type: Boolean,
        default: false,
      },
      manageCategory: {
        type: Boolean,
        default: false,
      },
      manageSuppliers: {
        type: Boolean,
        default: false,
      },
      viewAnalytics: {
        type: Boolean,
        default: false,
      },
      manageMarketing: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

const adminModel =
  mongoose.models.Admin || mongoose.model<Admin>("Admin", adminSchema);

export default adminModel;
