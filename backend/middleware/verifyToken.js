import jwt from "jsonwebtoken"
import User from "../models/userSchema.js"

export const verifyToken =  async(req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.authorization
    if(!authHeader){
        console.log("an error occurred in detecting the auth header")
        return res.status(401).json({status:false, message: "unauthorized"})
    }


    const token = authHeader.split(" ")[1]
    if(!token){
        console.log("token not found")
        return res.status(401).json({status: false, message: "authorized"})
    }


    if(!process.env.JWT_SECRET){
        console.log("secret key not found")
        return res.status(401).json({status: false, message: "authorized"})
    }


    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if(!decoded){
            console.log("jwt error")
            return res.status(403).json({status: false, message: "unforbidden"})
        }
        const user = await User.findById(decoded.id).select('id role')

        req.user = ({id: user._id.toString(), role: user.role})
        console.log('Verified user:', req.user); 
        next();


    } catch (error) {
        console.log(error)
        return res.status(400).json({
            status: false,
            message:"an error occurred here in the verification {jwt}"
        })
    }
}