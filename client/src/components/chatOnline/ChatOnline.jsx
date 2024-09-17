import React, { useEffect } from "react";
import "./chatonline.css";
import Logo from "./logo.jpeg";
import { useState } from "react";
import axios from "axios";

const ChatOnline = ({ userId }) => {
  const [onlineUser, setOnlineUser] = useState([]);
  useEffect(() => {
    // console.log("userOnlineWithId", userId);
    const fetchUser=async()=>{
      const res=await axios.get(`/users?userId=${userId}`);
      // console.log("res.data",res.data);
      setOnlineUser(res.data);
    }
    fetchUser();
   
  }, []);

  return (
    <div className="sidebarFriend">
      <div className="topRow">
        <img className="sidebarFriendImg" src={Logo} alt="" />
        <span className="sidebarFriendName">{onlineUser.username}</span>
      </div>
      <div className="badge">
        <span className="badgeText">1</span>
      </div>
    </div>
  );
};

export default ChatOnline;
