const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
  {
    members: {
        type: Array,
    }

  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", ConversationSchema);

//this will store the conversation between two users {user1,user2} user1=sender user2=receiver
