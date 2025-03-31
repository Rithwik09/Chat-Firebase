// import React, { useEffect, useState } from "react";
// import { db } from "../config/firebase";
// import {
//   collection,
//   query,
//   where,
//   onSnapshot,
//   updateDoc,
//   doc,
//   arrayUnion,
//   getDoc
// } from "firebase/firestore";

// const Chat = ({ userType, loggedInUserId }) => {
//   const [chats, setChats] = useState([]);
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState("");
//   const [activeChatId, setActiveChatId] = useState(null);
//   const [activeChatParticipant, setActiveChatParticipant] = useState(null);
//   const [unsubscribeChat, setUnsubscribeChat] = useState(null);

//   useEffect(() => {
//     if (!loggedInUserId) return;
//     console.log("Fetching chats for user:111111", loggedInUserId);

//     const chatsRef = collection(db, "chats");
//     const q = query(chatsRef, where("participants", "array-contains", loggedInUserId));

//     const unsubscribe = onSnapshot(q, (snapshot) => {
//       if (!snapshot.empty) {
//         const chatDocs = snapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));

//         setChats(chatDocs);

//         if (!activeChatId && chatDocs.length > 0) {
//           selectChat(chatDocs[0].id, chatDocs[0].participants);
//         }
//       }
//     });

//     return () => unsubscribe();
//   }, [loggedInUserId]);

//   const selectChat = async (chatId, participants) => {
//     setActiveChatId(chatId);
//     const otherParticipant = participants.find((id) => id !== loggedInUserId);
//     setActiveChatParticipant(otherParticipant || null);

//     if (unsubscribeChat) {
//       unsubscribeChat();
//     }

//     const chatRef = doc(db, "chats", chatId);
//     const unsubscribe = onSnapshot(chatRef, (snapshot) => {
//       if (snapshot.exists()) {
//         setMessages(snapshot.data().messages || []);
//       } else {
//         setMessages([]);
//       }
//     });

//     setUnsubscribeChat(() => unsubscribe);
//   };

//   const handleSend = async () => {
//     if (!newMessage.trim() || !loggedInUserId || !activeChatId) return;

//     try {
//       const chatDocRef = doc(db, "chats", activeChatId);
//       await updateDoc(chatDocRef, {
//         messages: arrayUnion({
//           senderId: loggedInUserId,
//           text: newMessage.trim(),
//           timestamp: new Date(),
//         }),
//       });
//       setNewMessage("");
//     } catch (error) {
//       console.error("Firestore Update Error:", error);
//     }
//   };

//   useEffect(() => {
//     console.log("Fetching chats for user:2222222", loggedInUserId);
//     const userType = localStorage.getItem("userType");
//     if (userType !== "support" || !loggedInUserId) return;
//     const supportRef = doc(db, "users", loggedInUserId);
//     // const unsubscribe = onSnapshot(supportRef, async (snapshot) => {
//     //   if (snapshot.exists()) {
//     //     const data = snapshot.data();
//     //     console.log("Support Data:", data);
//     //     if (data.activeChats && data.activeChats.length > 0) {
//     //       const latestChat = data.activeChats[data.activeChats.length - 1];

//     //       const chatDoc = await getDoc(doc(db, "chats", latestChat));
//     //       if (chatDoc.exists()) {
//     //         selectChat(latestChat, chatDoc.data().participants);
//     //       }
//     //     }
//     //   }
//     // });

//     const unsubscribe = onSnapshot(supportRef, async (snapshot) => {
//       if (snapshot.exists()) {
//         const data = snapshot.data();
//         console.log("Support Data:", data);
    
//         if (data.activeChats && data.activeChats.length > 0) {
//           const latestChat = data.activeChats[data.activeChats.length - 1];
    
//           const chatDoc = await getDoc(doc(db, "chats", latestChat));
//           if (chatDoc.exists()) {
//             selectChat(latestChat, chatDoc.data().participants);
//           }
//         } else {
//           // If there are no active chats, reset activeChatId
//           setActiveChatId(null);
//           setMessages([]);
//         }
//       }
//     });    

//     return () => unsubscribe();
//   }, [userType, loggedInUserId]);

//   return (
//     <div style={{ display: "flex", height: "100vh", fontFamily: "Arial, sans-serif" }}>
//       <div style={{ flex: 1, padding: "10px", maxWidth: "400px", margin: "auto", textAlign: "center" }}>
//         <h3>Support Chat</h3>

//         {chats.length > 0 ? (
//           <>
//             <div style={{ marginBottom: "10px" }}>
//               {chats.map((chat) => (
//                 <button
//                   key={chat.id}
//                   onClick={() => selectChat(chat.id, chat.participants)}
//                   style={{
//                     display: "block",
//                     width: "100%",
//                     padding: "8px",
//                     marginBottom: "5px",
//                     backgroundColor: activeChatId === chat.id ? "#4CAF50" : "#ddd",
//                     color: activeChatId === chat.id ? "#fff" : "#000",
//                     border: "none",
//                     cursor: "pointer",
//                   }}
//                 >
//                   Chat with {chat.participants.find((id) => id !== loggedInUserId)}
//                 </button>
//               ))}
//             </div>

//             {activeChatId && (
//               <>
//                 <p>Chatting with: {userType === "support" ? "Customer" : "Support"}</p>
//                 <div style={{ height: "60vh", overflowY: "auto", border: "1px solid #ddd", padding: "10px", marginBottom: "10px" }}>
//                   {messages.map((msg, index) => (
//                     <p key={index} style={{ textAlign: msg.senderId === loggedInUserId ? "right" : "left" }}>
//                       <strong>{msg.senderId === loggedInUserId ? "You" : "customer"}:</strong> {msg.text}
//                     </p>
//                   ))}
//                 </div>
//                 <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." style={{ width: "95%", padding: "8px" }} />
//                 <button onClick={handleSend} style={{ width: "18%", marginLeft: "2%", padding: "8px" }}>Send</button>
//               </>
//             )}
//           </>
//         ) : (
//           <p>No active chats found.</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Chat;

import React, { useEffect, useState } from "react";
import { db } from "../config/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  arrayUnion,
  // getDoc,
  orderBy,
  addDoc
} from "firebase/firestore";

const Chat = ({ userType, loggedInUserId }) => {
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [activeChatId, setActiveChatId] = useState(null);
  const [unsubscribeChat, setUnsubscribeChat] = useState(null);

  // useEffect(() => {
  //   console.log("Fetching chats for user:", loggedInUserId);
  //   if (!loggedInUserId) return;
  //   console.log("Fetching");
  //   let q;
  //   const chatsRef = collection(db, "chats");
  //   console.log("Chats Ref:", chatsRef);
  //   if (userType === "support") {
  //     q = query(chatsRef);
  //     console.log("Query:", q);
  //   } else {
  //     q = query(chatsRef, where("participants", "array-contains", loggedInUserId));
  //     console.log("Query2:", q);
  //   }

  //   const unsubscribe = onSnapshot(q, (snapshot) => {
  //     const chatDocs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  //     chatDocs.sort((a, b) => b.lastUpdated.toMillis() - a.lastUpdated.toMillis());
  //     setChats(chatDocs);
  //   });

  //   return () => unsubscribe();
  // }, [loggedInUserId, userType]);

  useEffect(() => {
    console.log("Fetching chats for user:", loggedInUserId);
    if (!loggedInUserId) return;
  
    const chatsRef = collection(db, "chats");
    console.log("Chats Ref:", chatsRef);
    const q = query(chatsRef, orderBy("lastUpdated", "desc")); // Sorting handled by Firestore
    console.log("Query:", q);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatDocs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      console.log("Chat Docs:", chatDocs);
      setChats(chatDocs);
    });
  
    return () => unsubscribe();
  }, [loggedInUserId]);
  
  const selectChat = async (chatId) => {
    setActiveChatId(chatId);
    if (unsubscribeChat) unsubscribeChat();

    const messagesRef = collection(db, "messages");
    const q = query(messagesRef, where("chatId", "==", chatId), orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    setUnsubscribeChat(() => unsubscribe);
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !loggedInUserId || !activeChatId) return;

    const newMsg = {
      chatId: activeChatId,
      senderId: loggedInUserId,
      text: newMessage.trim(),
      timestamp: new Date(),
    };

    try {
      await addDoc(collection(db, "messages"), newMsg);
      await updateDoc(doc(db, "chats", activeChatId), {
        lastMessage: newMessage.trim(),
        lastUpdated: new Date(),
        participants: arrayUnion(loggedInUserId),
      });
      setNewMessage("");
    } catch (error) {
      console.error("Firestore Update Error:", error);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial, sans-serif" }}>
      <div style={{ width: "30%", padding: "10px", borderRight: "1px solid #ccc", overflowY: "auto" }}>
        <h3>Chats</h3>
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => selectChat(chat.id)}
            style={{
              padding: "10px",
              cursor: "pointer",
              backgroundColor: activeChatId === chat.id ? "#4CAF50" : "#ddd",
              color: activeChatId === chat.id ? "#fff" : "#000",
              marginBottom: "5px",
            }}
          >
          Chat with {chat.customerId || "Unknown"}
          </div>
        ))}
      </div>

      <div style={{ flex: 1, padding: "10px" }}>
        {activeChatId ? (
          <>
            <h3>Chat</h3>
            <div style={{ height: "60vh", overflowY: "auto", border: "1px solid #ddd", padding: "10px", marginBottom: "10px" }}>
              {messages.map((msg, index) => (
                <p key={index} style={{ textAlign: msg.senderId === loggedInUserId ? "right" : "left" }}>
                  <strong>{msg.senderId === loggedInUserId ? "You" : "Customer"}:</strong> {msg.text}
                </p>
              ))}
            </div>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              style={{ width: "80%", padding: "8px" }}
            />
            <button onClick={handleSend} style={{ width: "18%", marginLeft: "2%", padding: "8px" }}>Send</button>
          </>
        ) : (
          <p>Select a chat to start messaging</p>
        )}
      </div>
    </div>
  );
};

export default Chat;