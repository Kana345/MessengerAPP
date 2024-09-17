import React from 'react'
import "./chatMenu.css"
import axios from "axios";
import { useState } from 'react';
import { SpaRounded } from "@material-ui/icons";
import { FcSearch } from "react-icons/fc";
import { AuthContext } from "../../context/AuthContext";
import CloseFriend from "../../components/closeFriend/CloseFriend";


const ChatMenu = ({conversation}) => {
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState(null);
    const [isSearched, setIsSearched] = useState(false);
    const { user } = React.useContext(AuthContext);
    const [conversations, setConversations] = useState([]);
    const [currentConversation, setCurrentConversation] = useState(null);

    const handleSearch = async () => {
        //search with username
        
        try {
          const resp = await axios.get(`/users?username=${search}`);
          // console.log("resp.data", resp.data);
          setSearchResult(resp.data);
          setIsSearched(false);
        } catch (error) {
          console.log(error);
          setIsSearched(true);
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
          const conversationExists = conversations?.find(
            (c) => c.members.includes(searchResult._id) && c.members.includes(user._id)
          );
    
          if (conversationExists) {
            alert("Conversation already exists");
            return;
          }else{
            alert("Friend request sent");
            setConversations([...conversations, resp.data]);
            setSearchResult(null);
          }
        } catch (error) {
          console.log(error);
        }
    
        
      };







  return (
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
                  <button
                    onClick={handleFriendRequest}
                  >
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

  )
}

export default ChatMenu
