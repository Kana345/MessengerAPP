import React, { useEffect, useRef } from "react";
import Topbar from "../../components/topbar/Topbar";
import "./messanger.css";
//closeFriend
import CloseFriend from "../../components/closeFriend/CloseFriend";
import Message from "../../components/Message/Message";
import ChatOnline from "../../components/chatOnline/ChatOnline";
import { useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

import { AuthContext } from "../../context/AuthContext";
import { SpaRounded } from "@material-ui/icons";
import { FcSearch } from "react-icons/fc";

import RoomChat from "../../components/RoomChat/RoomChat";

// CiSearch

const Messanger = () => {
  const { user } = React.useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [pastMessages, setPastMessages] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  // const [allFriends, setAllFriends] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  // const [isSearched, setIsSearched] = useState(false);
  const [arraivalMessage, setArraivalMessage] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
 
  const [mode, setMode] = useState("user"); //user or room

  const socket = useRef();
  const scrollRef = useRef(null);

  useEffect(() => {
    socket.current = io("ws://localhost:5900");
    socket.current.on("getMessage", (data) => {
      // console.log("socketserversenddata", data);
      const { senderId, text, conversationId } = data;
      // console.log("data", data);
      const newMessage = {
        sender: senderId,
        text: text,
        createdAt: Date.now(),
        conversationId: conversationId,
      };

      setArraivalMessage(newMessage);
    });
    socket.current.on("me", (data) => {
      // console.log("data", data);
    });

    socket.current.emit("addUser", user._id);
    socket.current.on("getUsers", (users) => {
      // console.log("users", users);
      setOnlineUsers(users);
    });

    //all listeners for rooms
  }, [user._id]);

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

  useEffect(() => {
    //fetch all messages between user and current friend
    // GET /api/getmessage/:conversationId
    const fetchMessages = async () => {
      const conversationId = currentConversation?._id;
      const resp = await axios.get(`/message/getmessage/${conversationId}`);
      // console.log("resp.data", resp.data);
      const messagesArr = resp.data;
      setPastMessages(messagesArr);
    };
    fetchMessages();
  }, [currentConversation, user._id]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await axios.get("/conversation/" + user._id);
        // console.log(res.data); //array of objects
        setConversations(res.data);
        const arrofObj = res.data;
        const friends = arrofObj.map((obj) => {
          return obj.members.find((m) => m !== user._id);
        });
        // console.log("friends", friends);
        // setAllFriends(friends);
      } catch (err) {
        console.log(err);
      }
    };

    fetchConversations();
  }, [user._id]);

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

  const handleSearch = async () => {
    //search with username

    try {
      const resp = await axios.get(`/users?username=${search}`);
      // console.log("resp.data", resp.data);
      setSearchResult(resp.data);
      // setIsSearched(false);
    } catch (error) {
      console.log(error);
      // setIsSearched(true);
    }
  };

  const handleFriendRequest = async () => {
    //create a new conversation
    // POST /api/conversation
    // console.log("frienf request clicked");
    const newConversation = {
      senderId: user?._id,
      receiverId: searchResult?._id,
    };
    try {
      const resp = await axios.post("/conversation", newConversation);
      // console.log("search", resp.data);
      //check if the conversation already exists
      const conversationExists = conversations.find(
        (c) =>
          c.members.includes(searchResult._id) && c.members.includes(user._id)
      );

      if (conversationExists) {
        alert("Conversation already exists");
        return;
      } else {
        alert("Friend request sent");
        setConversations([...conversations, resp.data]);
        setSearchResult(null);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Topbar />
      <div className="modeSetup">
        <button onClick={() => setMode("user")}>User</button>
        <button onClick={() => setMode("room")}>Room</button>
      </div>

      <div className="mainArea">
        {mode === "room" ? (
          <RoomChat socket={socket}/>
        ) : (
          <div className="main_container">
            <div className="chatMenu">
              <div className="chatMenuWrapper">
                <div className="searchUsers">
                  <input
                    type="text"
                    className="searchFriend"
                    placeholder="Search for friends"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {/* search icon */}

                  <FcSearch onClick={handleSearch} />
                </div>

                <br />
                <div className="searchquery">
                  {searchResult === null ? (
                    <span>No friend found</span>
                  ) : (
                    <div className="userProfile">
                      <img
                        className="userProfileImg"
                        src={
                          searchResult.profilePicture
                            ? searchResult.profilePicture
                            : "https://www.pngkey.com/png/full/114-1149878_setting-user-avatar-in-specific-size-without-breaking.png"
                        }
                        alt=""
                      />
                      <span className="userProfileName">
                        {searchResult.username}
                      </span>
                      <button onClick={handleFriendRequest}>
                        <span>"+"</span>
                      </button>
                    </div>
                  )}
                </div>
                <div className="friendList">
                  {conversations?.map((c) => {
                    //c is an object
                    return (
                      <>
                        <div
                          onClick={() => {
                            // console.log("clicked");
                            setCurrentConversation(c);
                          }}
                        >
                          <CloseFriend conversation={c} key={c._id} />
                        </div>
                      </>
                    );
                  })}
                </div>
               
              </div>
            </div>

            <div className="chatArea" ref={scrollRef}>
              <div className="chatAreaWrapper" ref={scrollRef}>
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

            <div className="onlineUser">
              <div className="onlineUserWrapper">
                {onlineUsers.map((onlineUser) => {
                  const { userId } = onlineUser;
                  return <ChatOnline userId={userId} />;
                })}
              </div>
             
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Messanger;
