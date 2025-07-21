const User = require("../models/user");
const FriendRequest = require("../models/friendRequest");

async function sendFriendRequest(req, res) {
  try {
    const userId = req.user.id;
    const { email } = req.body;

    const recipient = await User.findOne({ email });
    // Check if email exists
    if (!recipient) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if recipient is not self
    if (recipient._id.toString() === userId) {
      return res.status(400).json({
        code: "FRIEND",
        message: "You cannot add yourself as a friend",
      });
    }

    // Check if friend request already sent
    const existingSent = await FriendRequest.findOne({
      requester: userId,
      recipient: recipient._id,
      status: "pending",
    });
    if (existingSent) {
      return res
        .status(400)
        .json({ code: "ALREADY_SENT", message: "Friend request already sent" });
    }

    // Check if friend request already received
    const existingReceived = await FriendRequest.findOne({
      requester: recipient._id,
      recipient: userId,
      status: "pending",
    });
    if (existingReceived) {
      return res
        .status(400)
        .json({
          code: "ALREADY_RECEIVED",
          message: "Friend request already received",
        });
    }

    // Check if already friends
    const existingFriendship = await FriendRequest.findOne({
      $or: [
        {
          requester: userId,
          recipient: recipient._id,
          status: "accepted",
        },
        {
          requester: recipient._id,
          recipient: userId,
          status: "accepted",
        },
      ],
    });
    if (existingFriendship) {
      return res.status(400).json({
        code: "ALREADY_FRIENDS",
        message: "You are already friends with this user",
      });
    }

    // Create new friend request
    const friendRequest = new FriendRequest({
      requester: userId,
      recipient: recipient._id,
      status: "pending",
    });

    await friendRequest.save();
    res.status(201).json({ message: "Friend request sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

async function getSent(req) {
  const userId = req.user.id;
  return await FriendRequest.find({
    requester: userId,
    status: "pending",
  }).populate("recipient", "email name");
}

async function getReceived(req) {
  const userId = req.user.id;
  return await FriendRequest.find({
    recipient: userId,
    status: "pending",
  }).populate("requester", "email name");
}

async function getFriends(req) {
  const userId = req.user.id;
  return await FriendRequest.find({
    $or: [
      { requester: userId, status: "accepted" },
      { recipient: userId, status: "accepted" },
    ],
  })
    .populate("requester", "email name")
    .populate("recipient", "email name");
}

async function get(req, res) {
  try {
    if (req.query.type === "sent") {
      const sentRequests = await getSent(req);
      return res.status(200).json(sentRequests);
    } else if (req.query.type === "received") {
      const receivedRequests = await getReceived(req);
      return res.status(200).json(receivedRequests);
    } else if (req.query.type === "friends") {
      const friends = await getFriends(req);
      return res.status(200).json(friends);
    } else {
      return res.status(400).json({ message: "Invalid request type" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

async function deleteFriend(req, res) {
  try {
    const id1 = req.user.id;
    const id2 = req.params.id;

    const request = await FriendRequest.findOneAndDelete({
      $or: [
        { requester: id1, recipient: id2 },
        { requester: id2, recipient: id1 },
      ],
    });

    if (!request) {
      return res.status(404).json({ code: "NOT_FOUND" });
    }

    res.status(200).json({ code: "SUCCESS" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

async function addFriend(req, res) {
  try {
    const userId = req.user.id;
    const requesterId = req.params.id;

    const request = await FriendRequest.findOneAndUpdate(
      { requester: requesterId, recipient: userId, status: "pending" },
      { status: "accepted" },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ message: "Not found" });
    }

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

module.exports = { sendFriendRequest, get, deleteFriend, addFriend };
