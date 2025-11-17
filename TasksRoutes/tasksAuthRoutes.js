import express from "express";
const router = express.Router();
import {register, login} from "../controllers/AuthControllers.js"
import dotenv from "dotenv";
console.log("secret key", JWT_SECRET)
//api/tasks/auth
router.post("/signup", register)
router.post("/login", login)
export default router