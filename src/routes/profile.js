const express = require("express");
const { userAuth } = require("../middlewares/auth");
const { validateEditProfile } = require("../utils/validation");

const profileRouter = express.Router();

profileRouter.get("/profile", userAuth, async (req, res) => {
  try {
    const user = req.user;

    res.status(200).json({ message: "user profile", user });
  } catch (err) {
    console.error("Profile Error:", err);
    res.status(500).json({ message: err.message });
  }
});
profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditProfile(req)) {
      return res.status(400).json({ message: "Invalid request" });
    }
    const user = req.user;

    Object.keys(req.body).forEach((each) => (user[each] = req.body[each]));
    await user.save();
    res.status(200).json({ data: user, message: "user updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = {
  profileRouter,
};
