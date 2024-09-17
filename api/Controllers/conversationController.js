const Conversation = require("../models/conversationModel");


//@desc    Create a conversation
//@route   POST /api/conversation
//@access  Private


module.exports.CreateConversation=async(req,res)=>{
    const {senderId,receiverId}=req.body;
    const conversation=new Conversation({
        members:[senderId,receiverId]
    })

    try{
        const savedConversation=await conversation.save();
        res.status(200).json(savedConversation)
    }catch(err){
        res.status(500).json(err)
    }
}



//@desc    Get conversation of a user
//@route   GET /api/conversation/:userId
//@access  Private

module.exports.GetConversation=async(req,res)=>{
    const {userId}=req.params;
    //we have to find all conversations where the user is a member
    const allConversations=await Conversation.find({
        members:{$in:[userId]}
    })

    res.status(200).json(allConversations)
}