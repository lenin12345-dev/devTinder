const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectRequest = require("../models/connectionRequest");
const User = require("../models/user");

const requestRouter = express.Router();

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const toUserId = req.params.toUserId;
      const status = req.params.status;
      const fromUserId = req.user._id;
      const userExist = await User.findById(toUserId);

      if (!userExist) {
        return res
          .status(404)
          .json({ message: "User you are requesting not found" });
      }

      const allowedStatus = ["interested", "ignored"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const existingConnection = await ConnectRequest.findOne({
        $or: [
          {
            fromUserId,
            toUserId,
          },
          {
            fromUserId: toUserId,
            toUserId: fromUserId,
          },
        ],
      });
      if (existingConnection) {
        return res
          .status(400)
          .json({ message: "You have already sent a request or the person has sent you a request" });
      }

      const data = new ConnectRequest({
        fromUserId,
        toUserId,
        status,
      });
      await data.save();
      res.status(201).json({ data: data, message: "Request sent succesfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const { status, requestId } = req.params;
      const toUserId = req.user._id;
      const userExist = await User.findById(requestId);
      if (!userExist) {
        return res
          .status(404)
          .json({ message: "User who is requesting not found" });
      }


      
      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const connectReview = await ConnectRequest.findOne({
        fromUserId: requestId,
        toUserId:toUserId,
        status: "interested",
      });
      if (!connectReview) {
        return res
          .status(400)
          .json({ message: "connection request not found" });
      }
      connectReview.status = status
     const data = await connectReview.save()
     res.status(201).json({data:data });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = {
  requestRouter,
};
