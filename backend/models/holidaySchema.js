import mongoose from 'mongoose';

const HolidaySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
});

export default mongoose.model('Holiday', HolidaySchema);