import React from 'react'
import "./onlineUser.css"
import ChatOnline from "../../components/chatOnline/ChatOnline";
import { useState,useEffect } from 'react';

const OnlineUser = ({onlineUsers}) => {
    


  return (
    <div className="onlineUser">
    <div className="onlineUserWrapper">
      {
        onlineUsers?.map((onlineUser) => {
          const{userId} = onlineUser;
          return(
            <ChatOnline userId={userId}/>
          )

        })
      }
    </div>
  </div>
  )
}

export default OnlineUser
