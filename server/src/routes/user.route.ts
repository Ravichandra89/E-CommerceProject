import express, { Router } from "express";
import {
  LoginUser,
  RegisterUser,
  forgat_password,
  reset_password,
  logOut,
} from "../controllers/userauth.controller";
const userRoute = Router();

userRoute.post("/auth/register", RegisterUser);
userRoute.post("/auth/login", LoginUser);
userRoute.post("/auth/forgot_password", forgat_password);
userRoute.post("/auth/reset_password", reset_password);
userRoute.post("/auth/logout", logOut);

export default userRoute;
