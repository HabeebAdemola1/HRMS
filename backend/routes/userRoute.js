import User from "../models/userSchema.js";
import express from "express"
import Blacklist from "../models/blacklistSchema.js";
import Employee from "../models/employeeSchema.js";
import bcrypt from "bcrypt"

import jwt from "jsonwebtoken"
import { verifyToken } from "../middleware/verifyToken.js";
import nodemailer from "nodemailer"
import cloudinary from "cloudinary"
import crypto from "crypto"
import { v4 as uuidv4 } from 'uuid';
import dotenv from "dotenv"
const router = express.Router()



export const isAdmin = (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    console.log(req?.user?.role)
    if (req.user?.role?.toLowerCase() !== 'superadmin') {
      return res.status(403).json({ message: 'Access denied. Super-Admins only.' });
    }
    next();
  };


export const isPlan = async (req, res, next) => {
        const user = await User.findById(req.user.id);
        if (user.plan === 'Regular' && req.body.somePremiumFeature) {
          return res.status(403).json({ error: 'Upgrade to Premium or Platinum to use this feature' });
        }
       
   
}



const transporter = nodemailer.createTransport({
  service:'gmail',
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
    auth: {
        user:"essentialdevelopers22@gmail.com",
        pass:"xwzxeuvivvnclpac"
      },
 
})



cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });


    const sendOTPEmail = async (email, otp, firstName) => {
    const mailOptions = {
      from: "essentialdevelopers22@gmail.com",
      to: email,
      subject: "Verify your email",
      html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verification - E_Ride</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f5f5f5; color: #333;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
              <tr>
                <td style="padding: 20px; text-align: center; background-color: customPink; color: white; border-top-left-radius: 12px; border-top-right-radius: 12px;">
                  <h1 style="font-size: 28px; margin: 0; font-weight: bold; font-family: 'Helvetica', sans-serif;">E-HR</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="font-size: 24px; color: #333; margin-bottom: 20px; font-weight: 600; font-family: 'Helvetica', sans-serif;">Verify Your Email</h2>
                  <p style="font-size: 16px; line-height: 1.6; color:  "#2563eb"; margin-bottom: 20px;">
                    Hello ${firstName || "there"},
                  </p>
                  <p style="font-size: 16px; line-height: 1.6; color:  "#2563eb"; margin-bottom: 30px;">
                    Thank you for signing up with E_Ride! To complete your registration and secure your account, please verify your email address by entering the following 6-digit verification code:
                  </p>
                  <div style="text-align: center; margin: 30px 0; background-color: #f0f0f0; padding: 20px; border-radius: 8px;">
                    <span style="display: inline-block; font-size: 32px; font-weight: bold; color: customPink; letter-spacing: 6px; font-family: 'Helvetica', sans-serif;">
                      ${otp}
                    </span>
                  </div>
                  <p style="font-size: 16px; line-height: 1.6; color:  "#2563eb"; margin-bottom: 20px;">
                    This code will expire in 24 hours for your security. If you didn’t request this verification, please ignore this email or contact our support team at <a href="mailto:support@e-ride.com" style="color: #7E22CE; text-decoration: none; font-weight: 500;">support@e-ride.com</a>.
                  </p>
                  <p style="font-size: 16px; line-height: 1.6; color:  "#2563eb"; margin-bottom: 30px;">
                    If you have any questions, feel free to reach out to us. We’re here to help you get started with E-HR!
                  </p>
                  <div style="text-align: center; margin-top: 30px;">
                    <a href="http://localhost:5173/verifyemail?email=${encodeURIComponent(
                      email
                    )}" 
                       style="display: inline-block; padding: 12px 30px; background-color: customPink; color: white; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; font-family: 'Helvetica', sans-serif; transition: background-color 0.3s;">
                      Verify Now
                    </a>
                  </div>
                  <p style="font-size: 14px; color: #999; text-align: center; margin-top: 40px; font-family: 'Arial', sans-serif;">
                    © 2025 E_HR. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
    };
    try {
      const sentMail = await transporter.sendMail(mailOptions);
      console.log("Email sent successfully:", sentMail);
      return { success: true };
    } catch (error) {
      console.error("Email sending error:", error);
      return { success: false, error: error.message };
    }
  };
  

  router.post('/signup', async (req, res) => {
    const { name, email, password, plan, role } = req.body;
 
    try {
      const blacklisted = await Blacklist.findOne({ email });
      if (blacklisted) return res.status(403).json({ error: 'Email is blacklisted' });
  
      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ error: 'Email already exists' });
  

      
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log("Hashed Password:", hashedPassword); 

    
  
      const verificationToken = Math.floor(
        100000 + Math.random() * 900000
      ).toString();
      const uniqueNumber = `RL-${crypto
        .randomBytes(3)
        .toString("hex")
        .toUpperCase()}`;
      const verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    

      user = new User({ name, email, password:hashedPassword, plan, role, verificationToken, verificationTokenExpiresAt, uniqueNumber, userId: uuidv4(), });
      await user.save();
      const savedUser = await User.findOne({ email });
      console.log("Stored Password:", savedUser.password); // Debugging

      const response = await sendOTPEmail(
        user.email,
        verificationToken,
        name,
      );
      if (!response.success) {
        console.log("Email sending error:", response.error);
        return res
          .status(400)
          .json({ status: false, message: "Failed to send verification email" });
      }
  
      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.status(201).json({ token, user: { id: user._id, name, email, plan } });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Login
router.post('/login', async (req, res) => {
    const { email, password} = req.body;
  
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: 'Invalid email ' });
      if (user.isBlocked) return res.status(403).json({ error: 'Account is blocked' });

      // if(password !== user.password){
      //   console.log("incorrect password")
      //   return res.status(400).json({ message: 'incorrect password' })
      // }
      
      const isMatch = await bcrypt.compare(password, user.password);
      console.log("Password Match:", isMatch);
      if (!isMatch) return res.status(400).json({ message: 'incorrect password' });
   
      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

      let roleMessage = "";
      switch (user.role) {
        case "admin":
          roleMessage=`Welcome ${user.email}, your login is successful as the admin of ${user.name}`
          break;
        case "superadmin":
          roleMessage=`Welcome ${user.email}, your login is successful as the super-admin of ${user.name}`
          break;
        default:
          break;
      }
      res.status(200).json({ token, role: user.role, message: `successfully logged in. ${roleMessage}`, user: { id: user._id, name: user.name, email, plan: user.plan } });
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: error.message });
    }
  });



  router.post("/verify-email", async(req, res) => {
    try {
        const { email, code } = req.body;
        console.log("Verifying email:", { email, code });
    
        const user = await User.findOne({
          email,
          verificationToken: code,
          verificationTokenExpiresAt: { $gt: Date.now() },
        });
        if (!user) {
          return res
            .status(404)
            .json({
              status: false,
              message: "User not found or invalid verification code",
            });
        }
    
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
        await user.save();
    
        const payload = { user: { id: user._id } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: "7d",
        });
        res.json({
          success: true,
          message: "Email verified successfully",
          token,
          user: { id: user._id, email: user.email, isVerified: true, role:user.role },
        });
      } catch (err) {
        console.error("Email verification error:", err);
        res
          .status(500)
          .json({ status: false, message: err.message || "Server error occurred" });
      }  
})

router.post("/send-otp", async(req, res) => {
    try {
        const { email } = req.body;
        console.log("Resending OTP for email:", email);
    
        const user = await User.findOne({ email });
        if (!user) {
          return res.status(404).json({ status: false, message: "User not found" });
        }
    
        const verificationToken = Math.floor(
          100000 + Math.random() * 900000
        ).toString();
        const verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000;
    
        user.verificationToken = verificationToken;
        user.verificationTokenExpiresAt = verificationTokenExpiresAt;
        await user.save();
    
        const response = await sendOTPEmail(
          email,
          verificationToken,
          user.firstName
        );
        if (!response.success) {
          console.log("Email sending error:", response.error);
          return res
            .status(400)
            .json({ status: false, message: "Failed to resend verification code" });
        }
    
        res.json({
          status: true,
          message: "Verification code resent successfully",
        });
      } catch (err) {
        console.error("Send OTP error:", err);
        res.status(500).json({ status: false, message: "Server error occurred" });
      }
})


router.get("/dashboard", verifyToken, async(req, res) => {
  const userId = req.user.id

  try {
    const user = await User.findOne({_id: userId})
    if(!user){
      return res.status(401).json({
        status: false,
        message: "user not found"
      })
    }

    return res.status(200).json({
      user,
      message:`welcome back to your dashboard ${user.email}`,
      status: false
    })
  } catch (error) {
    console.log(error)
  }
})
  // Update Profile
  router.put('/profile', verifyToken, async (req, res) => {
    const { address, state, lg, phone } = req.body;
    try {
      const user = await User.findById(req.user.id);
      user.address = address || user.address;
      user.state = state || user.state;
      user.lg = lg || user.lg;
      user.phone = phone || user.phone;
      await user.save();
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
export default router