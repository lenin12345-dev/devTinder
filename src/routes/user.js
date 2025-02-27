const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectRequest = require("../models/connectionRequest");
const User = require("../models/user");

const userRouter = express.Router();

userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const user = req.user;
    const requests = await ConnectRequest.find({
      toUserId: user._id,
      status: "interested",
    }).populate("fromUserId", ["firstName", "lastName","photoUrl"]);

    res.json({ data: requests });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const user = req.user;
    const requests = await ConnectRequest.find({
      $or: [
        { fromUserId: user._id, status: "accepted" },
        { toUserId: user._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", ["firstName", "lastName","photoUrl"])
      .populate("toUserId", ["firstName", "lastName","photoUrl"]);
    const data = requests.map((each) => {
      if (each.fromUserId._id.toString() == user._id) {
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
    const user = req.user;
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit>50?50:limit
    const skip = (page-1) * limit
    const requests = await ConnectRequest.find({
      $or: [{ fromUserId: user._id }, { toUserId: user._id }],
    }).select("fromUserId toUserId");
    let hideUsers = new Set();

    requests.forEach((each) => {
      hideUsers.add(each.fromUserId.toString());
      hideUsers.add(each.toUserId.toString());
    });
    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUsers) } },
        { _id: { $ne: user._id } },
      ],
    }).select("_id firstName lastName photoUrl age skills").skip(skip).limit(limit)

    res.status(200).json({ data: users });
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
});

module.exports = {
  userRouter,
};
