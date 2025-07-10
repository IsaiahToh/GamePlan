const mongoose = require("../config/mongodb")

const friendRequestSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['pending', 'accepted'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('FriendRequest', friendRequestSchema);