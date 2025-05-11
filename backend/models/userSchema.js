import mongoose from "mongoose";
import bcrypt from "bcrypt"

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['superadmin', 'admin'], default: 'admin', required: true },
    plan: { type: String, enum: ['premium', 'regular', 'platinum'], required: true },
    address: { type: String },
    state: { type: String },
    lga: { type: String },
    phone: { type: String },
    isBlocked: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    uniqueNumber: { type: String, unique: true },
    uniqueNumber: { type: String, unique: true },
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
  });
  

  
  export default  mongoose.model('User', UserSchema);