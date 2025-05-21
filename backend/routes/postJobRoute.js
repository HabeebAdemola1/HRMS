import mongoose from "mongoose"
import Job from "../models/postJobSchema.js"
import User from "../models/userSchema.js"
import express from "express"
import {verifyToken} from "../middleware/verifyToken.js"
import ApplyJob from "../models/applyforJobSchema.js"
import nodemailer from "nodemailer"
import dotenv from "dotenv"


dotenv.config()
const jobRouters = express.Router()


jobRouters.post("/postjob", verifyToken, async(req, res) => {
        const {
        companyName,
        companyAbout,
        jobTitle,
        jobType,
        location,
        qualification,
        salary,
        requirements,
        duties,
        vacancies,
        experience,
    } = req.body;


    try {
            const employer = await User.findById(req.user.id);
               const newJob = new Job({
            employerId:req.user.id, 
            companyName: employer.name,
            companyAbout,
            jobTitle,
            jobType,
            qualification,
            location,
            salary,
            requirements,
            duties,
            vacancies,
            experience,
        });
        const savedJob = await newJob.save();
        res.status(201).json({ message: "Job posted successfully!", job: savedJob });
    } catch (error) {
        console.error("Error in posting job:", error.message);
        res.status(500).json({ error: error.message });
    }
    
})



jobRouters.post("/applyjob/:id", async (req, res) => {
  const {
    firstName,
    lastName,
    YOE,
    course,
    qualification,
    email,
    phone,
    address,
    grade,
  } = req.body;
  const jobId = req.params.id; 

  try {
   
    const job = await Job.findById(jobId);
 
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

  
    const newJobApplication = new ApplyJob({
      jobId, 
      employerId: job.employerId,
      firstName,
      lastName,
      YOE,
      course,
      qualification,
      email,
      phone,
      address,
      grade,
    });

    // Save the job application
    const savedJobApplication = await newJobApplication.save();
    res.status(201).json({ message: "Job application submitted successfully!", application: savedJobApplication });
  } catch (error) {
    console.error("Error in submitting job application:", error.message);
    res.status(500).json({ error: error.message });
  }
});


jobRouters.get("/getJobByemployer", verifyToken, async(req, res) => {
    try {
        const employerId = req.user.id;

        if(!mongoose.Types.ObjectId.isValid(employerId)){
            return res.status(400).json({message: 'invalid employer id'})
        }

        console.log("employer id ", employerId)

        const employerExist = await User.findById(new mongoose.Types.ObjectId(employerId))
        if(!employerExist){
            return res.status(404).json({message: "employer account doesnt exist"})
        }


        const job = await Job.find({employerId:new mongoose.Types.ObjectId(employerId)}).populate("jobTitle jobType salary requirements experience location createdAt")

        console.log("job found", job)
        res.status(200).json(job)
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "an error occurred"})
    }
})




jobRouters.get("/candidateapplyforJob", verifyToken, async(req, res) => {
       const employerId = req.user.id;
    try {
          const employer = await User.findById(req.user.id);
          if(!employer){
            return res.status(404).json({
                message: "employer is not found"
            })
          }
        
          const jobSeekers = await ApplyJob.find({employerId})
                .populate("jobId", "jobTitle jobType location salary requirements duties  vacancies")
                .populate("employerId", "name email phone")

           if(!jobSeekers){
            return res.status(404).json({
                message: "employer is not found"
            })
          }

          return res.status(200).json({
            message: "success",
            jobSeekers
          })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            status: false,
            message: "an error occured "
        })
    }
})



jobRouters.post('/shortlist', async (req, res) => {
  const { jobSeekerId, jobId, email, message } = req.body;

  try {
    // Verify job seeker and job
    const jobSeeker = await ApplyJob.findById(jobSeekerId);
    if (!jobSeeker) {
      return res.status(404).json({ message: 'Job seeker not found' });
    }
    if (jobSeeker.jobId.toString() !== jobId) {
      return res.status(400).json({ message: 'Invalid job ID' });
    }

    // Mark as shortlisted
    jobSeeker.shortlisted = true;
    await jobSeeker.save();

    // Send email
    const transporter = nodemailer.createTransport({
      service: 'gmail', 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Shortlist Notification for Job Application',
      text: message,
    });

    res.status(200).json({ message: 'Shortlisted and email sent' });
  } catch (error) {
    console.error('Error shortlisting:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



jobRouters.get("/getAll", async(req, res) => {
    try {
        const jobs = await Job.find({})
        res.status(200).json(jobs)
    } catch (error) {
        res.status(500).json({message:"an error occured"})
    }
})


jobRouters.get("/:jobId", async(req, res) => {
    try {
        const { jobId } = req.params;

        const job = await Job.findById(jobId).populate("employerId", "fname lname email");
        if (!job) {
            return res.status(404).json({ error: "Job not found." });
        }

        res.status(200).json(job);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})




jobRouters.get("/count/:employerId", verifyToken, async (req, res) => {
    const { employerId } = req.params;

    try {
       
        if (!mongoose.Types.ObjectId.isValid(employerId)) {
            return res.status(400).json({ message: "Invalid Employer ID format" });
        }

   
        const jobCount = await Job.countDocuments({ employerId });

    
        res.status(200).json({ jobCount });
    } catch (error) {
        console.error("Error counting jobs:", error);
        res.status(500).json({ message: error.message });
    }
});


jobRouters.get("/employer/:employerId", async(req, res) => {
    try {
        const { employerId } = req.params;

        const employer = await User.findById(employerId);
        if (!employer || employer.role !== "employer") {
            return res.status(404).json({ message: "Employer not found or invalid role." });
        }

        const jobs = await Job.find({ employerId });
        res.status(200).json(jobs);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message });
    }
})

export default jobRouters