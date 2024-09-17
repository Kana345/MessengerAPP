const io = require("socket.io")(5900, {
  cors: {
    origin: "http://localhost:3000",
  },
});

let onlineUsers = [];
//online roomes
let onlineRooms = []; //{roomId,socketId,userId}
let userJoinsRooms = [
  // { //roomId:[userId]
  //allUsers:array of userId}
]; //


let rommsMessages = [] //{roomId:[{senderId,text,createdAt,roomId}]}

const addUser = (userId, socketId) => {
  !onlineUsers.some((user) => user?.userId === userId) &&
    onlineUsers.push({ userId, socketId });
};

const removeUser = (userId) => {
  onlineUsers = onlineUsers.filter((user) => user?.userId !== userId);
};

const getUser = (userId) => {
  return onlineUsers.find((user) => user?.userId === userId);
};

//ROOMS

const createRoom = (roomId, socketId, userId) => {
  !onlineRooms.some((room) => room?.roomId === roomId) &&
    onlineRooms.push({ roomId, socketId, userId }) &&
    userJoinsRooms.push({
      roomId,
      allUsers: [],
    })&& rommsMessages.push({roomId,messages:[]});

    //console.log("AllonlineRooms", onlineRooms);
    io.emit("getRooms", onlineRooms);//send to all
};

const joinRoom = (roomId, socket, userId, io,userName) => {
  let room = onlineRooms?.find((room) => room?.roomId === roomId);

  if (room) {
    socket?.join(roomId);
    
    //console.log("room found");

    let userJoinRoom = userJoinsRooms?.find(
      (userJoinRoom) => userJoinRoom?.roomId === roomId
    );
    if (userJoinRoom) {
      //check if user already joined
      if (!userJoinRoom?.allUsers?.some((user) => user === userName)){
        console.log("user not joined before with this name",userName);
        userJoinRoom?.allUsers?.push(userName);
        socket?.to(roomId).emit("userJoin", {
          userId,
          userName,
          roomId,
        });//send to all except sender
      }
    }

    // io?.to(roomId).emit("getJoinedRoom", {
    //   roomId,
    //   userId,
    // });

    socket.emit("getJoinedRoom", {
      roomId,
      userId,
    });


  } else {
    //console.log("room not found");
  }
};


const leaveRoom = (roomId, socket, userId, io,userName) => {
  let room = onlineRooms?.find((room) => room?.roomId === roomId);
  console.log("roomfound",room);
  if (room) {
    

    let userRoom = userJoinsRooms?.find(
      (r) => r?.roomId === roomId
    );
console.log("userRoomfound",userRoom);
    if (userRoom) {
      //check if user already joined
      console.log("userRoombefore",userRoom);
      if (userRoom?.allUsers?.some((user) => user === userName)){
        //console.log("user joined before with this name",userName);
        socket.to(roomId).emit("userLeave", {
          userId,
          userName,
          roomId,
        });//send to all except sender
        socket.emit("iLeave",{
          userId,
          userName,
          roomId,
          
        });//send to sender only
    
        socket?.leave(roomId);
        userRoom.allUsers = userRoom?.allUsers?.filter(
          (user) => user !== userName
        );

      }
      console.log("userRoomAfter",userRoom);
    }


    // io.emit("getRooms", onlineRooms);


    
  }
};

io.on("connection", (socket) => {
  // //console.log("a user connected");
  socket.emit("me", socket.id);

  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", onlineUsers);
  });

  socket.on("sendMessage", (message) => {
    const { senderId, receiverId, text, conversationId } = message;
    // //console.log("message", message);
    const user = getUser(receiverId);
    io.to(user?.socketId).emit("getMessage", {
      senderId,
      text,
      conversationId,
    });
  });



//ROOMS
  socket.on("createRoom", (data) => {
    const { roomId, socketId, userId } = data;
    createRoom(roomId, socketId, userId,io);
    //   joinRoom(roomId, socket, userId, io);
    
  });

    socket.on("sendGroupChat", (data) => {
      const { roomId, senderId, text } = data;
      //console.log("sendGroupChat", data);
      //store messages in rommsMessages
      let roomMessages = rommsMessages?.find(
        (roomMessages) => roomMessages?.roomId === roomId
      );
      if (roomMessages) {
        roomMessages?.messages?.push({
          senderId,
          text,
          createdAt: Date.now(),
          roomId,
        });
      } else {
        rommsMessages.push({
          roomId,
          messages: [
            {
              senderId,
              text,
              createdAt: Date.now(),
              roomId,
            },
          ],
        });
      }

      io.to(roomId).emit("getGroupChat", {
        senderId,
        text,
        createdAt: Date.now(),
        roomId
      });
    });

    socket.on("joinRoom", (data) => {
      const { roomId, userId ,userName} = data;
      joinRoom(roomId, socket, userId, io,userName);
      //    ;

    });

    socket.on("IneedAllRooms", () => {
      //console.log("IneedAllRooms");
      io.emit("getRooms", onlineRooms);
    });

    socket.on("getPrevGroupMessages", (roomId) => {
      //console.log("getPrevGroupMessages", roomId);
      let roomMessages = rommsMessages?.find(
        (roomMessages) => roomMessages?.roomId === roomId
      );
      if (roomMessages) {
        // io.to(roomId).emit("sentPrevGroupMessages", {
        //   roomId,
        //   messagesPrev: roomMessages?.messages,
        // });

        socket.emit("sentPrevGroupMessages", {
          roomId,
          messagesPrev: roomMessages?.messages,
        });
      }
    });

    socket.on("deleteRoom", (data) => {
      const { roomId, userId } = data;
      //console.log("deleteRoom", data);
      let room = onlineRooms?.find((room) => room?.roomId === roomId);
      if (room) {
        io.to(roomId).emit("roomDeleted", roomId);
        onlineRooms = onlineRooms.filter((room) => room?.roomId !== roomId);
        userJoinsRooms = userJoinsRooms.filter(
          (userJoinRoom) => userJoinRoom?.roomId !== roomId
        );
        //delete room messages
        rommsMessages = rommsMessages.filter(
          (roomMessages) => roomMessages?.roomId !== roomId
        );
        //emit to all users in room getonlineRooms
        io.emit("getRooms", onlineRooms);

      }


    });
    
    socket.on("getUsersInRoom", (roomId) => {
      //console.log("getUsersInRoom", roomId);
      let room = userJoinsRooms?.find((room) => room?.roomId === roomId);
      if (room) {
        // io.to(roomId).emit("setUsersInRoom", {
        //   roomId,
        //   users: room?.allUsers,
        // });
        socket.emit("setUsersInRoom", {
          roomId,
          users: room?.allUsers,
        });
      }
    });

    socket.on("leaveRoom", (data) => {
      const { roomId, userId ,userName} = data;
      //console.log("leaveRoom", data);
      leaveRoom(roomId, socket, userId, io,userName);

     
    });


  socket.on("disconnect", () => {
    //console.log("a user disconnected");
    const user = onlineUsers.find((user) => user.socketId === socket.id);
    removeUser(user?.userId);
  });
});

//using socket.io rooms
// create-room (argument: room)
// delete-room (argument: room)
// join-room (argument: room, id)
// leave-room (argument: room, id)

//   io.of("/").adapter.on("create-room", (room) => {
//     //console.log(`room ${room?.roomId} was created`);
//   });
