import mongoose from "mongoose";

const BlacklistSchema = new mongoose.Schema({
    
  email: { type: String, required: true, unique: true },
  reason: { type: String },
  blacklistedAt: { type: Date, default: Date.now },
});

export default mongoose.model('Blacklist', BlacklistSchema);