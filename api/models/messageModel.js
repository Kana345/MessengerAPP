const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
        type: String,
    },
    sender: {
        type: String,
    },
    text:{
        type:String,
    }

  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", MessageSchema);

//this will store the conversation between two users {user1,user2} user1=sender user2=receiver
