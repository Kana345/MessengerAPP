import React from 'react'
import "./chatArea.css"
import axios from "axios";
import { useState,useRef ,useEffect} from 'react';
import { AuthContext } from '../../context/AuthContext';
import Message from "../../components/Message/Message";


const ChatArea = ({socket,currentConversation}) => {

    const scrollRef = useRef(null);
    const { user } = React.useContext(AuthContext);
    const [newMessage, setNewMessage] = useState("");
    const [arraivalMessage, setArraivalMessage] = useState(null);
    const [pastMessages, setPastMessages] = useState([]);

    const handleClick = () => {
        // e.preventDefault();
        // console.log("clicked");
        const newMessageObj = {
          sender: user._id,
          text: newMessage,
          conversationId: currentConversation._id,
        };
        // console.log("newMessageObj", newMessageObj);
    
        socket.current.emit("sendMessage", {
          senderId: user._id,
          receiverId: currentConversation.members.find(
            (member) => member !== user._id
          ),
          text: newMessage,
          conversationId: currentConversation._id,
        });
    
        // scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    
        const sendMessage = async () => {
          try {
            const resp = await axios.post("/message/addmessage", newMessageObj);
            // console.log("resp.data", resp.data);
            setPastMessages([...pastMessages, resp.data]);
            setNewMessage("");
          } catch (err) {
            console.log(err);
          }
        };
    
        sendMessage();
      };

      useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
        //we have to check conversationId
        //if conversationId is same as currentConversation._id
        //then we have to add the message to pastMessages
    
        if (arraivalMessage?.conversationId === currentConversation?._id) {
          // console.log("arraivalMessage", arraivalMessage);
          setPastMessages([...pastMessages, arraivalMessage]);
        }
    
        // setPastMessages([...pastMessages,arraivalMessage])
      }, [arraivalMessage]);
      
    

  return (
    <div className="chatArea"
    ref={scrollRef}
  >
    <div className="chatAreaWrapper"
      ref={scrollRef}
    >
      {!currentConversation ? (
        <span>Open a conversation to start a chat.</span>
      ) : (
        pastMessages.map((m) => {
          return (
            <Message
              own={m?.sender === user?._id}
              message={m}
              key={m?._id}
            />
          );
        })
      )}
      {/* <Message />
      <Message own={true} />
      <Message />
      <Message own={true} /> */}
    </div>
    <div className="TypingSection">
      <input
        type="text"
        className="messageInput"
        placeholder="Type a message"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
      />
      <button onClick={handleClick}>Send</button>
    </div>
  </div>


  )
}

export default ChatArea
