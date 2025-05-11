import mongoose from "mongoose";
import dotenv from "dotenv"


dotenv.config()

export const dbConnect = async(req, res) => {
    try {
        const connect = await mongoose.connect(process.env.MONGO_URL)
        if(!connect){
            console.log("database not connected")
        }

        console.log("database is successfully connected to your app, happy coding!!!")
    } catch (error) {
        console.log(error)
        
    }
}