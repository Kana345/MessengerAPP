import { useEffect,useState } from "react";
import "./closeFriend.css";
import Logo from './logo.jpeg';
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react";




export default function CloseFriend({conversation}) {
  const { user } = useContext(AuthContext);
  const [friend, setFriend] = useState(null);

  useEffect(() => {
    //get friend id from conversation
    const friendId=conversation?.members.find((m)=>m!==user._id);
    // console.log("conversation-->",conversation);
    // console.log("friendId--->",friendId);
    //fetch user details
    const getFriendById = async () => {
      const userId=friendId;
      const resp=await axios.get(`/users?userId=${userId}`);
      // console.log(resp.data);
      setFriend(resp.data);
    }
    getFriendById();
  }, []);
  
    // useEffect(() => {
    //   //fetch user details
    //   // const getFriendById = async () => {
    //   //   const userId=fr_id;
    //   //   const resp=await axios.get(`/users?userId=${userId}`);
    //   //   console.log(resp.data);
    //   //   setFriend(resp.data);
    //   // };
    //   // getFriendById();
    // }, []);
  return (
    <li className="sidebarFriend ">
      <img className="sidebarFriendImg" src={Logo} alt="" />
      <span className="sidebarFriendName">{friend?.username}</span>
    </li>
  );
}
