import mongoose, { Schema, Document } from "mongoose";

export interface Product extends Document {
  supplier_id: mongoose.Types.ObjectId;
  category_id: mongoose.Types.ObjectId;
  reviews: mongoose.Types.ObjectId[];
  name: string;
  description: string;
  price: mongoose.Types.Decimal128;
  stock: number;
  images: string[];
  rating: number;
}

const productSchema: Schema<Product> = new mongoose.Schema(
  {
    supplier_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      validate: {
        validator: (value: mongoose.Types.Decimal128) =>
          parseFloat(value.toString()) > 0,
        message: "Price must be greater than zero.",
      },
    },
    stock: {
      type: Number,
      required: true,
      min: [0, "Stock cannot be negative."],
    },
    images: {
      type: [String],
      required: true,
    },
    rating: {
      type: Number,
      default: 0, // Default rating
      min: [0, "Rating cannot be less than 0."],
      max: [5, "Rating cannot be greater than 5."],
    },
  },
  {
    timestamps: true,
  }
);

const productModel =
  mongoose.models.Product || mongoose.model<Product>("Product", productSchema);

export default productModel;
