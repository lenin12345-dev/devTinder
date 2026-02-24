const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectRequest = require("../models/connectionRequest");
const Swipe = require("../models/Like");
const User = require("../models/user");

const userRouter = express.Router();

userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const requests = await ConnectRequest.find({
      toUserId: userId,
      status: "interested",
    }).populate("fromUserId", ["firstName", "lastName", "photoUrl"]);

    res.json({ data: requests });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const requests = await ConnectRequest.find({
      $or: [
        { fromUserId: userId, status: "accepted" },
        { toUserId: userId, status: "accepted" },
      ],
    })
      .populate("fromUserId", ["firstName", "lastName", "photoUrl"])
      .populate("toUserId", ["firstName", "lastName", "photoUrl"]);

    const data = requests.map((each) => {
      if (each.fromUserId._id.toString() == userId) {
        return each.toUserId;
      }
      return each.fromUserId;
    });

    res.json({ data: data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const userId = req.userId;

    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const cursor = req.query.cursor;

    const requests = await ConnectRequest.find({
      $or: [{ fromUserId: userId }, { toUserId: userId }],
    }).select("fromUserId toUserId");

    let hideUsers = new Set();

    requests.forEach((r) => {
      hideUsers.add(r.fromUserId.toString());
      hideUsers.add(r.toUserId.toString());
    });

    const swipes = await Swipe.find({
      fromUser: userId,
    }).select("toUser");

    swipes.forEach((s) => {
      hideUsers.add(s.toUser.toString());
    });

    let query = {
      _id: { $nin: [...hideUsers, userId] },
    };

    if (cursor) {
      query._id.$lt = cursor;
    }

    const users = await User.find(query)
      .sort({ _id: -1 })
      .limit(limit + 1);

    const hasMore = users.length > limit;
    if (hasMore) users.pop();

    res.json({
      data: users,
      nextCursor: users.length ? users[users.length - 1]._id : null,
      hasMore,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = {
  userRouter,
};
