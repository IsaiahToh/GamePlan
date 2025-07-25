const User = require("../models/user");
const Dashboard = require("../models/dashboard");
const FriendRequest = require("../models/friendRequest");
const UserTask = require("../models/task");

async function deleteAccount(req, res) {
  try {
    const userId = req.user.id;
    const email = req.query.email;
    await Promise.all([
      User.findOneAndDelete({ email }),
      Dashboard.findOneAndDelete({ userId }),
      UserTask.findOneAndDelete({ userId }),
      FriendRequest.deleteMany({
        $or: [{ requester: userId }, { recipient: userId }],
      }),
    ]);
    res.status(200).json({ message: "Delete successful" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "An unexpected error occurred" });
  }
}

module.exports = { deleteAccount };
