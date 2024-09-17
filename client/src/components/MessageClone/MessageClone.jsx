import React, { useEffect } from "react";
import "./messageClone.css";
import { format } from "timeago.js";
import { useState } from "react";
import { useContext } from "react";
import axios from "axios";

const MessageClone = ({ own,message }) => {
    // console.log("own",own);
    const [messageSender, setMessageSender] = useState("");

    useEffect(() => {
        const fetchUser = async () => {
            const res = await axios.get(`/users?userId=${message?.senderId}`);
            setMessageSender(res.data.username);
        };
        fetchUser();
    }, []);

    
  return (
    <div className="messageContainer ">
      <div className={own===true ? "message own" : "message"}>
        <div className="messageTop">
          <img
            className="messageImg"
            src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            alt=""
          />
            <span className="mesageText">{message?.text}</span>
        </div>
            <span className="Timestamp">{format(message?.createdAt)}</span>
            <span className="sendeBywhom">
                send by {own===true ? "You" : messageSender}
            </span>
      </div>
    </div>
  );
};

export default MessageClone;
