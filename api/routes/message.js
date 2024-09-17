const router=require("express").Router();
const Message=require("../models/messageModel");


const {addMessage,getMessage}=require("../Controllers/messagecontroller");

router.post("/addmessage",addMessage);
router.get("/getmessage/:conversationId",getMessage);



module.exports=router;