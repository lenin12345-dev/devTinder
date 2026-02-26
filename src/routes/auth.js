const express = require("express");
const authRouter = express.Router();
const { validation } = require("../../src/utils/validation");
const User = require("../../src/models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { REFRESH_SECRET } = require("../config/jwt");

authRouter.post("/signup", async (req, res) => {
  try {
    validation(req);

    const {
      firstName,
      lastName,
      emailId,
      password,
      photoUrl,
      age,
      skills,
      gender,
    } = req.body;

    // check existing user
    const existingUser = await User.findOne({ emailId });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      emailId,
      age,
      skills,
      gender,
      photoUrl,
      password: hashedPassword,
    });

    await user.save();

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // store refresh token in DB
    user.refreshToken = refreshToken;
    await user.save();

    // send cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "User created successfully",
      data: { _id: user._id, firstName: user.firstName, emailId: user.emailId },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId }).select("+refreshToken");
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isValid = await user.validatePassword(password);
    if (!isValid)
      return res.status(401).json({ message: "Invalid credentials" });

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Login successful",
      data: {
        data: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          emailId: user.emailId,
          photoUrl: user.photoUrl,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
authRouter.post("/refresh", async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, REFRESH_SECRET);

    const user = await User.findById(decoded._id).select("+refreshToken");
    if (!user || user.refreshToken !== token)
      return res.status(403).json({ message: "Invalid session" });

    const newAccessToken = user.generateAccessToken();

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.json({ message: "Token refreshed" });
  } catch {
    res.status(403).json({ message: "Session expired" });
  }
});

authRouter.post("/logout", async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, REFRESH_SECRET);

        await User.findByIdAndUpdate(decoded._id, {
          refreshToken: null,
        });
      } catch (err) {
        console.log("Invalid or expired refresh token during logout");
      }
    }

    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: "LOGOUT_ERROR" });
  }
});

module.exports = {
  authRouter,
};
