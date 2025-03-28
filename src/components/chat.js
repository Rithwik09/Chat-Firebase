// import React, { useEffect, useState } from "react";
// import { db } from "../config/firebase";
// import { collection, query, where, onSnapshot, updateDoc, doc, arrayUnion } from "firebase/firestore";

// const Chat = ({ userType, loggedInUserId }) => {
//   const [chats, setChats] = useState([]);
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState("");
//   const [activeChatId, setActiveChatId] = useState(null);
//   const [activeChatParticipant, setActiveChatParticipant] = useState(null);

//   console.log("Fetching chats for user:", loggedInUserId);
//   // const loggedInUserId =  localStorage.getItem("loggedInUserId");
//   useEffect(() => {
//     if (!loggedInUserId) return;

//     const chatsRef = collection(db, "chats");
//     const q = query(chatsRef, where("participants", "array-contains", loggedInUserId));

//     const unsubscribe = onSnapshot(q, (snapshot) => {
//       if (!snapshot.empty) {
//         const chatDocs = snapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));

//         console.log("Chats found:", chatDocs);
//         setChats(chatDocs);

//         // Auto-select the first chat if none is active
//         if (!activeChatId && chatDocs.length > 0) {
//           selectChat(chatDocs[0].id, chatDocs[0].participants);
//         }
//       } else {
//         console.log("No chats found for this user.");
//       }
//     });

//     return () => unsubscribe();
//   }, [loggedInUserId]);

//   const selectChat = async (chatId, participants) => {
//     setActiveChatId(chatId);
//     const otherParticipant = participants.find((id) => id !== loggedInUserId);
//     setActiveChatParticipant(otherParticipant || null);

//     // Real-time listener for selected chat
//     const chatRef = doc(db, "chats", chatId);
//     const unsubscribe = onSnapshot(chatRef, (snapshot) => {
//       if (snapshot.exists()) {
//         setMessages(snapshot.data().messages || []);
//       } else {
//         setMessages([]);
//       }
//     });

//     return () => unsubscribe();
//   };

//   const handleSend = async () => {
//     const loggedInUserId =  localStorage.getItem("loggedInUserId");
//     if (!newMessage.trim()) {
//       console.error("Error: Cannot send an empty message.");
//       return;
//     }
//     if (!loggedInUserId) {
//       console.error("Error: loggedInUserId is undefined.");
//       return;
//     }
//     if (!activeChatId) {
//       console.error("Error: No active chat selected.");
//       return;
//     }
  
//     try {
//       const chatDocRef = doc(db, "chats", activeChatId);
//       await updateDoc(chatDocRef, {
//         messages: arrayUnion({
//           senderId: loggedInUserId,
//           text: newMessage.trim(),
//           timestamp: new Date(),
//         }),
//       });
  
//       console.log("Message sent:", newMessage);
//       setNewMessage(""); // Clear input field after sending
//     } catch (error) {
//       console.error("Firestore Update Error:", error);
//     }
//   };
  
//   return (
//     <div style={{ display: "flex", height: "100vh", fontFamily: "Arial, sans-serif" }}>
//       <div style={{ flex: 1, padding: "10px", maxWidth: "400px", margin: "auto", textAlign: "center" }}>
//         <h3>Support Chat</h3>
        
//         {/* Chat List */}
//         {chats.length > 1 && (
//           <div style={{ marginBottom: "10px" }}>
//             {chats.map((chat) => (
//               <button
//                 key={chat.id}
//                 onClick={() => selectChat(chat.id, chat.participants)}
//                 style={{
//                   display: "block",
//                   width: "100%",
//                   padding: "8px",
//                   marginBottom: "5px",
//                   backgroundColor: activeChatId === chat.id ? "#4CAF50" : "#ddd",
//                   color: activeChatId === chat.id ? "#fff" : "#000",
//                   border: "none",
//                   cursor: "pointer",
//                 }}
//               >
//                 Chat with {chat.participants.find((id) => id !== loggedInUserId)}
//               </button>
//             ))}
//           </div>
//         )}

//         {activeChatId ? (
//           <>
//             <p>Chatting with: {userType === "support" ? "Customer" : "Support"}</p>

//             {/* Messages */}
//             <div
//               style={{
//                 height: "60vh",
//                 overflowY: "auto",
//                 border: "1px solid #ddd",
//                 padding: "10px",
//                 marginBottom: "10px",
//               }}
//             >
//               {messages.map((msg, index) => (
//                 <p key={index} style={{ textAlign: msg.senderId === loggedInUserId ? "right" : "left" }}>
//                   <strong>{msg.senderId === loggedInUserId ? "You" : "customer"}:</strong> {msg.text}
//                 </p>
//               ))}
//             </div>

//             {/* Send Message */}
//             <input
//               type="text"
//               value={newMessage}
//               onChange={(e) => setNewMessage(e.target.value)}
//               placeholder="Type a message..."
//               style={{ width: "80%", padding: "8px" }}
//             />
//             <button onClick={handleSend} style={{ width: "18%", marginLeft: "2%", padding: "8px" }}>
//               Send
//             </button>
//           </>
//         ) : (
//           <p>No active chat found.</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Chat;


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
//   const [unsubscribeChat, setUnsubscribeChat] = useState(null); // Store active listener cleanup function

//   console.log("Fetching chats for user:", loggedInUserId);

//   useEffect(() => {
//     if (!loggedInUserId) return;

//     const chatsRef = collection(db, "chats");
//     const q = query(chatsRef, where("participants", "array-contains", loggedInUserId));

//     const unsubscribe = onSnapshot(q, (snapshot) => {
//       if (!snapshot.empty) {
//         const chatDocs = snapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));

//         console.log("Chats found:", chatDocs);
//         setChats(chatDocs);

//         // Auto-select the first chat only if none is active
//         if (!activeChatId && chatDocs.length > 0) {
//           selectChat(chatDocs[0].id, chatDocs[0].participants);
//         }
//       } else {
//         console.log("No chats found for this user.");
//       }
//     });

//     return () => unsubscribe();
//   }, [loggedInUserId]);

//   const selectChat = async (chatId, participants) => {
//     setActiveChatId(chatId);
//     const otherParticipant = participants.find((id) => id !== loggedInUserId);
//     setActiveChatParticipant(otherParticipant || null);

//     // Clean up previous listener before setting a new one
//     if (unsubscribeChat) {
//       unsubscribeChat();
//     }

//     // Real-time listener for selected chat
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
//     if (!newMessage.trim()) {
//       console.error("Error: Cannot send an empty message.");
//       return;
//     }
//     if (!loggedInUserId) {
//       console.error("Error: loggedInUserId is undefined.");
//       return;
//     }
//     if (!activeChatId) {
//       console.error("Error: No active chat selected.");
//       return;
//     }

//     try {
//       const chatDocRef = doc(db, "chats", activeChatId);
//       await updateDoc(chatDocRef, {
//         messages: arrayUnion({
//           senderId: loggedInUserId,
//           text: newMessage.trim(),
//           timestamp: new Date(),
//         }),
//       });

//       console.log("Message sent:", newMessage);
//       setNewMessage(""); // Clear input field after sending
//     } catch (error) {
//       console.error("Firestore Update Error:", error);
//     }
//   };

//   // Notify the support agent when a new chat starts
//   useEffect(() => {
//     console.log("Listening for active chats...");
//     const userType =  localStorage.getItem("userType");
//     console.log("User Type:", userType);
//     if (userType !== "support" || !loggedInUserId) return;

//     const supportRef = doc(db, "users", loggedInUserId);
//     const unsubscribe = onSnapshot(supportRef, async (snapshot) => {
//       if (snapshot.exists()) {
//         const data = snapshot.data();
//         console.log("Active chats updated:", data.activeChats);

//         // Automatically open the most recent chat
//         if (data.activeChats && data.activeChats.length > 0) {
//           const latestChat = data.activeChats[data.activeChats.length - 1];

//           // Fetch the full chat document
//           const chatDoc = await getDoc(doc(db, "chats", latestChat));
//           if (chatDoc.exists()) {
//             selectChat(latestChat, chatDoc.data().participants);
//           }
//         }
//       }
//     });

//     return () => unsubscribe();
//   }, [userType, loggedInUserId]);

//   return (
//     <div style={{ display: "flex", height: "100vh", fontFamily: "Arial, sans-serif" }}>
//       <div style={{ flex: 1, padding: "10px", maxWidth: "400px", margin: "auto", textAlign: "center" }}>
//         <h3>Support Chat</h3>

//         {/* Chat List */}
//         {chats.length > 1 && (
//           <div style={{ marginBottom: "10px" }}>
//             {chats.map((chat) => (
//               <button
//                 key={chat.id}
//                 onClick={() => selectChat(chat.id, chat.participants)}
//                 style={{
//                   display: "block",
//                   width: "100%",
//                   padding: "8px",
//                   marginBottom: "5px",
//                   backgroundColor: activeChatId === chat.id ? "#4CAF50" : "#ddd",
//                   color: activeChatId === chat.id ? "#fff" : "#000",
//                   border: "none",
//                   cursor: "pointer",
//                 }}
//               >
//                 Chat with {chat.participants.find((id) => id !== loggedInUserId)}
//               </button>
//             ))}
//           </div>
//         )}

//         {activeChatId ? (
//           <>
//             <p>Chatting with: {userType === "support" ? "Customer" : "Support"}</p>

//             {/* Messages */}
//             <div
//               style={{
//                 height: "60vh",
//                 overflowY: "auto",
//                 border: "1px solid #ddd",
//                 padding: "10px",
//                 marginBottom: "10px",
//               }}
//             >
//               {messages.map((msg, index) => (
//                 <p key={index} style={{ textAlign: msg.senderId === loggedInUserId ? "right" : "left" }}>
//                   <strong>{msg.senderId === loggedInUserId ? "You" : "customer"}:</strong> {msg.text}
//                 </p>
//               ))}
//             </div>

//             {/* Send Message */}
//             <input
//               type="text"
//               value={newMessage}
//               onChange={(e) => setNewMessage(e.target.value)}
//               placeholder="Type a message..."
//               style={{ width: "95%", padding: "8px" }}
//             />
//             <button onClick={handleSend} style={{ width: "18%", marginLeft: "2%", padding: "8px" }}>
//               Send
//             </button>
//           </>
//         ) : (
//           <p>No active chat found.</p>
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
  getDoc
} from "firebase/firestore";

const Chat = ({ userType, loggedInUserId }) => {
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [activeChatId, setActiveChatId] = useState(null);
  const [activeChatParticipant, setActiveChatParticipant] = useState(null);
  const [unsubscribeChat, setUnsubscribeChat] = useState(null);

  useEffect(() => {
    if (!loggedInUserId) return;
    console.log("Fetching chats for user:111111", loggedInUserId);

    const chatsRef = collection(db, "chats");
    const q = query(chatsRef, where("participants", "array-contains", loggedInUserId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const chatDocs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setChats(chatDocs);

        if (!activeChatId && chatDocs.length > 0) {
          selectChat(chatDocs[0].id, chatDocs[0].participants);
        }
      }
    });

    return () => unsubscribe();
  }, [loggedInUserId]);

  const selectChat = async (chatId, participants) => {
    setActiveChatId(chatId);
    const otherParticipant = participants.find((id) => id !== loggedInUserId);
    setActiveChatParticipant(otherParticipant || null);

    if (unsubscribeChat) {
      unsubscribeChat();
    }

    const chatRef = doc(db, "chats", chatId);
    const unsubscribe = onSnapshot(chatRef, (snapshot) => {
      if (snapshot.exists()) {
        setMessages(snapshot.data().messages || []);
      } else {
        setMessages([]);
      }
    });

    setUnsubscribeChat(() => unsubscribe);
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !loggedInUserId || !activeChatId) return;

    try {
      const chatDocRef = doc(db, "chats", activeChatId);
      await updateDoc(chatDocRef, {
        messages: arrayUnion({
          senderId: loggedInUserId,
          text: newMessage.trim(),
          timestamp: new Date(),
        }),
      });
      setNewMessage("");
    } catch (error) {
      console.error("Firestore Update Error:", error);
    }
  };

  useEffect(() => {
    console.log("Fetching chats for user:2222222", loggedInUserId);
    const userType = localStorage.getItem("userType");
    if (userType !== "support" || !loggedInUserId) return;
    const supportRef = doc(db, "users", loggedInUserId);
    // const unsubscribe = onSnapshot(supportRef, async (snapshot) => {
    //   if (snapshot.exists()) {
    //     const data = snapshot.data();
    //     console.log("Support Data:", data);
    //     if (data.activeChats && data.activeChats.length > 0) {
    //       const latestChat = data.activeChats[data.activeChats.length - 1];

    //       const chatDoc = await getDoc(doc(db, "chats", latestChat));
    //       if (chatDoc.exists()) {
    //         selectChat(latestChat, chatDoc.data().participants);
    //       }
    //     }
    //   }
    // });

    const unsubscribe = onSnapshot(supportRef, async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        console.log("Support Data:", data);
    
        if (data.activeChats && data.activeChats.length > 0) {
          const latestChat = data.activeChats[data.activeChats.length - 1];
    
          const chatDoc = await getDoc(doc(db, "chats", latestChat));
          if (chatDoc.exists()) {
            selectChat(latestChat, chatDoc.data().participants);
          }
        } else {
          // If there are no active chats, reset activeChatId
          setActiveChatId(null);
          setMessages([]);
        }
      }
    });    

    return () => unsubscribe();
  }, [userType, loggedInUserId]);

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial, sans-serif" }}>
      <div style={{ flex: 1, padding: "10px", maxWidth: "400px", margin: "auto", textAlign: "center" }}>
        <h3>Support Chat</h3>

        {chats.length > 0 ? (
          <>
            <div style={{ marginBottom: "10px" }}>
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => selectChat(chat.id, chat.participants)}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "8px",
                    marginBottom: "5px",
                    backgroundColor: activeChatId === chat.id ? "#4CAF50" : "#ddd",
                    color: activeChatId === chat.id ? "#fff" : "#000",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Chat with {chat.participants.find((id) => id !== loggedInUserId)}
                </button>
              ))}
            </div>

            {activeChatId && (
              <>
                <p>Chatting with: {userType === "support" ? "Customer" : "Support"}</p>
                <div style={{ height: "60vh", overflowY: "auto", border: "1px solid #ddd", padding: "10px", marginBottom: "10px" }}>
                  {messages.map((msg, index) => (
                    <p key={index} style={{ textAlign: msg.senderId === loggedInUserId ? "right" : "left" }}>
                      <strong>{msg.senderId === loggedInUserId ? "You" : "customer"}:</strong> {msg.text}
                    </p>
                  ))}
                </div>
                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." style={{ width: "95%", padding: "8px" }} />
                <button onClick={handleSend} style={{ width: "18%", marginLeft: "2%", padding: "8px" }}>Send</button>
              </>
            )}
          </>
        ) : (
          <p>No active chats found.</p>
        )}
      </div>
    </div>
  );
};

export default Chat;
