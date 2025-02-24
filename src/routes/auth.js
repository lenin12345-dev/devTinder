const express = require("express");
const authRouter = express.Router();
const { validation } = require("../../src/utils/validation");
const User = require("../../src/models/user");
const bcrypt = require("bcrypt");



authRouter.post("/signup", async (req, res) => {
  try {
    validation(req);
    
    const { firstName, lastName, emailId, password,age,skills,gender } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      emailId,
      age,
      skills,
      gender,
      password: hashedPassword,
    });

    await user.save();
    res.status(201).json({ message: "user created successfully" });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ message: err.message });
  }
});
authRouter.post("/login", async (req, res) => {
    try {

      const { emailId, password } = req.body;
      const user = await User.findOne({ emailId });

      if (!user) {
        return res.status(404).json({ message: "Invalid credential" });
      }
      const isValidPassword = await user.validatePassword(password);

      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credential" });
      }
      const token = await user.getJWT()
      
      res.cookie("token",token)
      res.status(200).json({ data:user,message: "login successful" });
    } catch (err) {
      console.error("Login Error:", err);
      res.status(500).json({ message: err.message });
    }
  });

  authRouter.post("/logout",(req,res)=>{
    res.cookie("token",null,{
        expires: new Date(Date.now())
    })
    res.send("Logout Successfully")
  })

module.exports = {
    authRouter
}