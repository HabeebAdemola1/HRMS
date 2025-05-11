import User from "../models/userSchema.js";
import express from "express"
import Blacklist from "../models/blacklistSchema.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "./userRoute.js";



const superAdminrouter = express.Router();


// Block User
superAdminrouter.patch('/block/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if(user.isBlocked === true){
        return res.status(400).json({message: "user is already is blocked"})
    }
    user.isBlocked = true;
    await user.save();
    res.status(200).json({ message: 'User blocked' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Blacklist User
superAdminrouter.post('/blacklist', verifyToken, isAdmin, async (req, res) => {
  const { email, reason } = req.body;
  try {
    const blacklist = new Blacklist({ email, reason });
    await blacklist.save();
    res.status(201).json({ message: 'User blacklisted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default superAdminrouter;