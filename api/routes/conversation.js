const router=require("express").Router();


const {CreateConversation,GetConversation}=require("../Controllers/conversationController")

router.route("/").post(CreateConversation)

//get conversation of a user


router.route("/:userId").get(GetConversation)






module.exports=router;