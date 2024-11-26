import mongoose, { Schema, Document } from "mongoose";

export interface Profile extends Document {
  user_id: mongoose.Types.ObjectId;
  profileImage?: string;
  shoppingAddress: {
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  orderList?: mongoose.Types.ObjectId[];
  wishList?: mongoose.Types.ObjectId[];
}

const profileSchema: Schema<Profile> = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  profileImage: {
    type: String,
    default: "", // S3 / Cloudinary URL
  },
  shoppingAddress: [
    {
      addressLine1: {
        type: String,
        required: true,
      },
      addressLine2: {
        type: String,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
      postalCode: {
        type: String,
        required: true,
      },
    },
  ],
  
});

const profileModel =
  mongoose.models.Profile || mongoose.model<Profile>("Profile", profileSchema);

export default profileModel;
