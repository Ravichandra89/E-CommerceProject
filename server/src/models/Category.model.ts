import mongoose, { Schema, Document } from "mongoose";

export interface Category extends Document {
  name: string;
  description: string;
  image?: string;
  parentCategoryId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema: Schema<Category> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    parentCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category", // Selft Response for nested category object
    },
  },
  {
    timestamps: true,
  }
);

const categoryModel =
  mongoose.models.Category ||
  mongoose.model<Category>("Category", categorySchema);

export default categoryModel;
