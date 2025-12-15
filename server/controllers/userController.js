
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

//controller for user signup


export const signup = async (req, res) => {
    try {
        const { email, fullName, password,bio } = req.body;
        // Check if user already exists
        if(!email || !fullName || !password || !bio){
            return res.status(400).json({ message: "All fields are required" });
        }
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        // Create new user
        const newUser = new User({ email, fullName, password: hashedPassword,bio});
        await newUser.save();
        const token = generateToken(newUser._id);
        res.json({success:true,userData:newUser, token,message:"Signup successful" });
        
        
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const login = async (req, res) =>{
    try {
        const { email, password } = req.body;
        if(!email || !password){
            return res.status(400).json({ message: "All fields are required" });
        }
        const userData = await User.findOne({ email});

        if (!userData || !(await bcrypt.compare(password, userData.password))) {
    return res.status(400).json({ message: "Invalid credentials" });
}
        const token = generateToken(userData._id);
        res.json({success:true,userData, token,message:"Login successful" });

    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Server error" });
    }

} 

//controller to check if user is authenticated
export const checkAuth = async (req, res) => {
    res.json({user:req.user});
}

//controller to update user profile
export const updateProfile = async (req, res) => {
    try {
        const { fullName, bio, profilepic } = req.body;
        const userId = req.user._id;
        let updateUser;
        if(!profilepic){
            updateUser = await User.findByIdAndUpdate(userId, { fullName, bio }, { new: true }).select('-password');
        }else{
            const upload = await cloudinary.uploader.upload(profilepic);
            updateUser = await User.findByIdAndUpdate(userId, { fullName, bio ,profilePic : upload.secure_url}, { new: true }).select('-password');


        }
        res.json({user:updateUser,message:"Profile updated successfully"});
    } catch (error) {
        console.error("Error during profile update:", error);
        res.status(500).json({ message: "Server error" });
    }   
}  
