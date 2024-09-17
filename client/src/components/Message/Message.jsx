import React from "react";
import "./message.css";
import { format } from "timeago.js";


const Message = ({ own,message }) => {
    // console.log("own",own);
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
      </div>
    </div>
  );
};

export default Message;
