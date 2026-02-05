const express = require("express");
const { userAuth } = require("../middlewares/auth");
const Swipe = require("../models/Swipe");
const User = require("../models/user");

const swipeRouter = express.Router();

// Create or update a swipe (like or dislike)
swipeRouter.post("/swipe/:toUserId/:action", userAuth, async (req, res) => {
  try {
    const fromUserId = req.user._id;
    const { toUserId, action } = req.params;

    const allowedActions = ["like", "dislike"];
    if (!allowedActions.includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    if (fromUserId.toString() === toUserId) {
      return res.status(400).json({ message: "You cannot swipe on yourself" });
    }

    const userExist = await User.findById(toUserId);
    if (!userExist) {
      return res.status(404).json({ message: "User not found" });
    }

    const swipe = await Swipe.findOneAndUpdate(
      { fromUser: fromUserId, toUser: toUserId },
      { action },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ message: "Swipe recorded", swipe });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all swipes done by logged-in user
swipeRouter.get("/swipes", userAuth, async (req, res) => {
  try {
    const swipes = await Swipe.find({ fromUser: req.user._id })
      .populate("toUser", "firstName lastName photoUrl");

    res.status(200).json({ swipes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check if two users liked each other (match)
swipeRouter.get("/match/:userId", userAuth, async (req, res) => {
  try {
    const fromUserId = req.user._id;
    const toUserId = req.params.userId;

    // Check if both users liked each other
    const swipe1 = await Swipe.findOne({ fromUser: fromUserId, toUser: toUserId, action: "like" });
    const swipe2 = await Swipe.findOne({ fromUser: toUserId, toUser: fromUserId, action: "like" });

    const isMatch = !!(swipe1 && swipe2);

    res.status(200).json({ isMatch });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = {
  swipeRouter,
};
