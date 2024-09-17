const Message=require("../models/messageModel");




//@desc    Add a message
//@route   POST /api/addmessage
//@access  Private

module.exports.addMessage=async(req,res)=>{
    const {conversationId,sender,text}=req.body;
    const message=new Message({
        conversationId,
        sender,
        text
    })

    try {
        const savedMessage=await message.save();
        res.status(200).json(savedMessage)
    } catch (error) {
            res.status(500).json(error)
    }
}

//@desc    Get a message
//@route   GET /api/getmessage/:conversationId
//@access  Private

module.exports.getMessage=async(req,res)=>{
    const {conversationId}=req.params;
    try {
        const messages=await Message.find({
            conversationId
        })
        res.status(200).json(messages)
    } catch (error) {
        res.status(500).json(error)
    }
}