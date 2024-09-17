import React from "react";
import "./roomChat.css";
import { useState, useRef, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import MessageClone from "../MessageClone/MessageClone";
import axios from "axios";
import Topbar from "../topbar/Topbar";
import { useContext } from "react";

const RoomChat = ({ socket }) => {
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef(null);
  const { user } = useContext(AuthContext);
  const [pastMessages, setPastMessages] = useState([]);
  const [onlineRooms, setOnlineRooms] = useState();
  const [currentRoom, setCurrentRoom] = useState(null);
  const [arrivalMessage, setArrivalMessage] = useState(null);

  const [roomIdTyped, setRoomIdTyped] = useState("");
  const [currentUsersInRoom, setCurrentUsersInRoom] = useState([]);
  // const [arrivedMessage, setArrivedMessage] = useState(null);
  //i need a storage array for all the rooms according to each room

  const handleRoomJoin = async (e) => {
    //we have to send the roomId to the server for joining the room
    socket?.current?.emit("joinRoom", {
      roomId: e.target.value,
      socketId: socket?.current.id,
      userId: user?._id,
      userName: user?.username,
    });

    // //console.log("joinRoomdata", e.target.value,user?.username);

    // setCurrentRoom(e.target.value);
    ////console.log("currentRoom", currentRoom);
  };

  const handleClick = () => {
    socket?.current?.emit("sendGroupChat", {
      text: newMessage,
      senderId: user?._id,
      roomId: currentRoom,
    });

    setNewMessage("");
  };

  const handleDeleteRoom = async (e) => {
    ////console.log("deleteRoom", e.target.value);
    socket?.current.emit("deleteRoom", {
      roomId: e.target.value,
      // socketId: socket?.current.id,
      userId: user?._id,
    });
  };
  // const {user}=useContext(AuthContext);

  const handleCreateRoom = async (e) => {
    ////console.log("createRoom", roomId);
    socket?.current.emit("createRoom", {
      roomId: roomIdTyped,
      socketId: socket?.current.id,
      userId: user?._id,
    });

    setRoomIdTyped("");
  };

  const handleRoomLeave = async () => {
    socket?.current?.emit("leaveRoom", {
      roomId: currentRoom,
      socketId: socket?.current.id,
      userId: user?._id,
      userName: user?.username,
    });
    //  setRoomId("");
  };

  useEffect(() => {
    scrollRef?.current?.scrollIntoView({ behavior: "smooth" });
    if (arrivalMessage && arrivalMessage.roomId === currentRoom) {
      setPastMessages((prev) => [...prev, arrivalMessage]);
    }
    // ////console.log("arrivalMessage", arrivalMessage);
    ////console.log("pastMessages", pastMessages);
  }, [arrivalMessage]);

  useEffect(() => {
    socket?.current?.on("getRooms", (onlineRooms) => {
      // ////console.log("onlineRoomsReceved", onlineRooms);
      setOnlineRooms(onlineRooms);
    });

    socket?.current?.on("getJoinedRoom", (data) => {
      // console.log("getJoinedRoombefore", data,currentRoom);
      setCurrentRoom(data.roomId);
      // console.log("getJoinedRoomafter", data,currentRoom);
    });
    socket?.current?.on("userJoin", (data) => {
      // ////console.log("userJoin", data);
      const { roomId, userName } = data;
      //console.log("userjoin", roomId, userName, currentRoom);
      if (roomId === currentRoom) {
        setCurrentUsersInRoom((prev) => [...prev, userName]);
      }
    });

    socket?.current?.on("getGroupChat", (data) => {
      // const { senderId, text, createdAt } = data;
      // const resultMessage = { senderId, text, createdAt };
      setArrivalMessage(data);
    });

    socket?.current?.on("sentPrevGroupMessages", (data) => {
      ////console.log("sentPrevGroupMessagesnow", data);
      const { messagesPrev } = data;

      setPastMessages(messagesPrev);
    });

    socket?.current?.on("setUsersInRoom", (data) => {
      // ////console.log("setUsersInRoom", data);//data contain id
      const { users } = data;
      setCurrentUsersInRoom(users);

      // setCurrentUsersInRoom(users);
    });

    socket.current.on("userLeave", (data) => {
      console.log("userLeaveotherrecieved", data, currentRoom);
      // socket?.current?.emit("getUsersInRoom", currentRoom);

      const { roomId, userName } = data;
      //console.log("roomIdleave", roomId, userName, currentRoom, currentUsersInRoom);
     
      socket.current.emit("getUsersInRoom", currentRoom);
      
    });

    socket.current.on("iLeave", (data) => {
      //console.log("iLeaverecieved", data);
      const { roomId, userName } = data;
      console.log("iLeaverecievedbefore", data,currentRoom);
      setCurrentRoom(null);
      setCurrentUsersInRoom([]);
      console.log("iLeaverecievedafter", data,currentRoom);
    });
  }, []);

  useEffect(() => {
    //in initial render i need to get all the online rooms
    socket?.current?.emit("IneedAllRooms");
  }, []);

  useEffect(() => {
    //we have to get the messages of the current room
    socket?.current?.emit("getPrevGroupMessages", currentRoom);
    //we have to get the users in the current room
    socket?.current?.emit("getUsersInRoom", currentRoom);
  }, [currentRoom]);

  return (
    <>
      <div className="main_container">
        <div className="createRoom">
          <div className="createRoomWrapper">
            <div className="createRoomTop">
              <h3>Create a Room</h3>
              <i className="fas fa-times"></i>
              <input
                type="text"
                name=""
                id=""
                onChange={(e) => setRoomIdTyped(e.target.value)}
                value={roomIdTyped}
              />
            </div>
            <div className="createRoomBottom">
              <button className="createRoomButton" onClick={handleCreateRoom}>
                Create
              </button>
              <button className="cancelRoomButton">Cancel</button>
            </div>
          </div>
        </div>
        <div className="chatAreaMain">
          {!currentRoom ? (
            <span>join room to chat</span>
          ) : (
            <>
              <div className="chatAreaTop">
                <div className="chatAreaTopLeft">
                  <span>{currentRoom}</span>
                </div>
                <div className="chatAreaTopRight">
                  <button className="leaveBtn" onClick={handleRoomLeave}>
                    leave
                  </button>
                </div>
              </div>

              <div className="chatAreaWrapperMain">
                <div className="chatArea" ref={scrollRef}>
                  <div className="chatAreaWrapper" ref={scrollRef}>
                    {!currentRoom ? (
                      <span>Open a Room to start a chat.</span>
                    ) : (
                      pastMessages.map((m) => {
                        return (
                          <MessageClone
                            own={m?.senderId === user?._id}
                            message={m}
                            key={m?._id}
                          />
                        );
                      })
                    )}
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
              </div>
            </>
          )}
        </div>

        <div className="rightDiv">
          <div className="AllUsers">
            <div className="AllUsersWrapper">
              <div className="AllUsersTop">
                <h3>Users</h3>
              </div>
              <div className="AllUsersContainer">
                <div className="AllUser">
                  {currentUsersInRoom?.map((c) => {
                    return (
                      <div className="AllUserInfo">
                        <img
                          src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
                          alt=""
                          className="AllUserImg"
                        />
                        <span className="AllUserName">{c}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="onlineRooms">
            <div className="onlineRoomsWrapper">
              <div className="onlineRoomsTop">
                <h3>Online Rooms</h3>
                <i className="fas fa-times"></i>
                <hr />
              </div>

              <div className="onlineRoomsContainer">
                {onlineRooms?.map((room) => (
                  <div className="onlineRoom">
                    <div className="onlineRoomInfo">
                      <span className="onlineRoomName">{room?.roomId}</span>
                    </div>
                    <div className="onlineRoomButton">
                      <button
                        className="onlineRoomJoinButton"
                        value={room?.roomId}
                        onClick={handleRoomJoin}
                      >
                        Join
                      </button>

                      <button
                        className={
                          room?.userId === user?._id
                            ? "onlineRoomLeaveButton"
                            : "onlineRoomLeaveButton hide"
                        }
                        value={room?.roomId}
                        onClick={handleDeleteRoom}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RoomChat;
