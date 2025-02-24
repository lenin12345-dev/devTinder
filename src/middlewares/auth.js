const jwt = require("jsonwebtoken")
const User = require("../models/user")

const userAuth = async(req,res,next)=>{
    try {
    const {token} = req.cookies;

    if(!token){
        return res.status(401).json({message:"Unauthorized"})
    }
    const decodedObj = await jwt.verify(token,"lenindev")
    
    const {_id} = decodedObj
    const user = await User.findById(_id)
    if(!user){
        return res.status(404).json({message:"User not found"})
        }
        req.user = user;
        next()
    }catch(err){
      res.status(400).send("Error" + err.message)
    }

}

module.exports = {
    userAuth
}