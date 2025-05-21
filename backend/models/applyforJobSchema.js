import mongoose from "mongoose";
const applicationSchema = new mongoose.Schema({

    employerId: { type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
        
    jobId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    firstName:{
        type:String,
        required: true
    },
    lastName:{
        type:String,
        required: true
    },
    YOE:{
        type:Number,
        required: true
    },
  
    course:{
        type:String,
        
    },
    qualification:{
        type:String,
        required: true
    },
    email:{
        type:String,
        required: true
    },
    phone:{
        type:String,
        required: true
    },
    address:{
        type:String,
        required: true
    },
    grade:{
        type:String,
       
    },
  

    dateApplied: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model('Application', applicationSchema);


