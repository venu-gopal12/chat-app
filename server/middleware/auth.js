// Middleware to protect routes
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protectRoute = async (req, res, next) => {
    try{
        // support both "Authorization: Bearer <token>" and "token: <token>"
        const authHeader = req.headers.authorization;
        const rawToken = authHeader && authHeader.startsWith('Bearer ')
            ? authHeader.split(' ')[1]
            : req.headers.token;

        if (!rawToken) {
            return res.status(401).json({ message: "Token missing" });
        }

        const decoded = jwt.verify(rawToken, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        if(!user){
            return res.status(401).json({ message: "User not found" });
        }
        req.user = user; // user doc, has .id and ._id
        next();
    }catch(error){
        console.error("Auth middleware error:", error);
        return res.status(401).json({ message: "Not authorized" });
    }
}