import { Request, Response } from "express";
import userModel from "../models/User.model";
import bcrypt from "bcrypt";
import apiResponse from "../utils/ApiResponse";
import generateToken from "../utils/jwtHelper";
import { sendOtpEmail } from "../utils/EmailHelper";
import profileModel from "../models/Profile.model";
import mongoose from "mongoose";
import wishlistModel from "../models/WishList";

const RegisterUser = async (req: Request, res: Response) => {
  try {
    const { first_name, last_name, email, phone, password } = req.body;
    const saltRounds = 10;

    if (!first_name || !last_name || !email || !password || !phone) {
      return apiResponse(res, 400, false, "Please fill all fields");
    }

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return apiResponse(res, 409, false, "User already exists");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await userModel.create({
      first_name,
      last_name,
      email,
      phone,
      password: hashedPassword,
    });

    return apiResponse(res, 201, true, "User created successfully", {
      user: {
        id: newUser._id,
      },
    });
  } catch (error) {
    console.error("Error while registering user:", error);
    return apiResponse(res, 500, false, "Internal server error");
  }
};

const LoginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return apiResponse(res, 400, false, "Please fill all fields");
    }

    // Check if user exist or not
    const userExist = await userModel.findOne({
      email,
    });

    if (!userExist) {
      return apiResponse(res, 404, false, "User not found");
    }

    const userPassword = await bcrypt.compare(password, userExist.password);

    if (!userPassword) {
      return apiResponse(res, 401, false, "Invalid password");
    }

    // Generate the jwt token
    const token = generateToken({ id: userExist._id, email: userExist.email });

    return apiResponse(res, 200, true, "Login Successfull", {
      token,
      user: {
        id: userExist._id,
        email: userExist.email,
      },
    });
  } catch (error) {
    console.error("Error while Logging User", error);
    return apiResponse(res, 500, false, "Internal server error");
  }
};

const logOut = async (req: Request, res: Response) => {
  try {
    res.clearCookie("token", { httpOnly: true, secure: true });
    return apiResponse(res, 200, true, "Logged out successfully");
  } catch (error) {
    console.error("Error while logOut", error);
    return apiResponse(res, 500, false, "Internal server error");
  }
};

const forgat_password = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return apiResponse(res, 400, false, "Please fill all fields");
    }

    const user = await userModel.findOne({
      email,
    });

    if (!user) {
      return apiResponse(res, 404, false, "User not found");
    }

    // send and generate the otp
    const otp = await sendOtpEmail(user.email);

    user.passwordResetOTP = otp;
    user.passwordResetOTPExpiration = Date.now() + 600000;
    await user.save();

    return apiResponse(res, 200, true, "Otp sent succesfully!");
  } catch (error) {
    console.error("Error forgetting password", error);
    return apiResponse(res, 500, false, "Internal server error");
  }
};

const reset_password = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;
    const saltRounds = 10;

    if (!email || !otp || !newPassword) {
      return apiResponse(res, 400, false, "Please fill all fields");
    }

    const user = await userModel.findOne({
      email,
    });

    if (!user) {
      return apiResponse(res, 404, false, "User not found");
    }

    if (user.passwordResetOTP !== otp) {
      return apiResponse(res, 400, false, "Invalid otp");
    }

    // Check if otp is expired or not
    if (Date.now() > user.passwordResetOTPExpiration) {
      return apiResponse(res, 400, false, "Otp has expired");
    }

    // hash the newPassword
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    user.password = hashedPassword;
    user.passwordResetOTP = null;
    user.passwordResetOTPExpiration = null;
    await user.save();

    return apiResponse(res, 200, true, "Password reset Succesfully!");
  } catch (error) {
    console.error("Error Reseting password", error);
    return apiResponse(res, 500, false, "Internal server error");
  }
};


export {
  RegisterUser,
  LoginUser,
  logOut,
  forgat_password,
  reset_password,
};
