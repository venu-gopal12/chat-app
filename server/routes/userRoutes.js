
import express from 'express';
import { signup,login,checkAuth,updateProfile } from '../controllers/userController.js';
import { protectRoute } from '../middleware/auth.js';
const userRouter = express.Router();



userRouter.post("/signup",signup);
//login route
userRouter.post("/login",login);
//route to check if user is authenticated
userRouter.get("/check",protectRoute,checkAuth);
//route to update user profile
userRouter.put("/update-profile",protectRoute,updateProfile);

export default userRouter;