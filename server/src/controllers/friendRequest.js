const User = require("../models/user");
const FriendRequest = require("../models/friendRequest");

async function sendFriendRequest(req, res) {
  try {
    const requesterId = req.user.id;
    const { email } = req.body;

    const recipient = await User.findOne({ email });
    if (!recipient) {
      return res.status(404).json({ message: "User not found" });
    }
    if (recipient._id.toString() === requesterId) {
      return res.status(400).json({ code: "FRIEND", message: "You cannot add yourself as a friend" });
    }
    const existingRequest = await FriendRequest.findOne({
      requester: requesterId,
      recipient: recipient._id,
      status: "pending",
    });
    if (existingRequest) {
      return res.status(400).json({ code: "ALREADY", message: "Friend request already sent" });
    }

    const friendRequest = new FriendRequest({
      requester: requesterId,
      recipient: recipient._id,
      status: "pending",
    });

    await friendRequest.save();
    res.status(201).json({ message: "Friend request sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

async function getSent(req, res) {
  try {
    const userId = req.user.id;
    const sentRequests = await FriendRequest.find({ requester: userId, status: "pending" })
      .populate("recipient", "email");

    if (!sentRequests || sentRequests.length === 0) {
      return res.status(404).json({ message: "No sent friend requests found" });
    }

    res.status(200).json(sentRequests);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

async function deleteFriendRequest(req, res) {
  try {
    const requesterId = req.user.id;
    const recipientId = req.params.id;

    const request = await FriendRequest.findOneAndDelete({
      requester: requesterId,
      recipient: recipientId,
      status: "pending",
    });

    if (!request) {
      return res.status(404).json({ code: "NOT_FOUND" });
    }

    res.status(200).json({ code: "SUCCESS"});
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
module.exports = { sendFriendRequest, getSent, deleteFriendRequest };
