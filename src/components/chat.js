// import React, { useEffect, useState } from "react";
// import { db } from "../config/firebase";
// import { collection, query, onSnapshot, addDoc, orderBy, where } from "firebase/firestore";

// const Chat = ({ user }) => {
//   const [users, setUsers] = useState([]);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState("");

//   useEffect(() => {
//     // Fetch users
//     const usersRef = collection(db, "users");
//     const unsubscribe = onSnapshot(usersRef, (snapshot) => {
//       setUsers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
//     });

//     return () => unsubscribe();
//   }, []);

//   useEffect(() => {
//     if (selectedUser) {
//       // Fetch messages for selected user
//       const chatId = user.uid > selectedUser.uid ? `${user.uid}_${selectedUser.uid}` : `${selectedUser.uid}_${user.uid}`;
//       const messagesRef = collection(db, "messages");
//       const q = query(messagesRef, where("chatId", "==", chatId), orderBy("timestamp"));

//       const unsubscribe = onSnapshot(q, (snapshot) => {
//         setMessages(snapshot.docs.map((doc) => doc.data()));
//       });

//       return () => unsubscribe();
//     }
//   }, [selectedUser, user]);

//   // const handleSend = async () => {
//   //   if (!newMessage.trim() || !selectedUser) return;

//   //   const chatId = user.uid > selectedUser.uid ? `${user.uid}_${selectedUser.uid}` : `${selectedUser.uid}_${user.uid}`;
//   //   await addDoc(collection(db, "messages"), {
//   //     chatId,
//   //     senderId: user.uid,
//   //     receiverId: selectedUser.uid,
//   //     message: newMessage,
//   //     timestamp: new Date(),
//   //   });

//   //   setNewMessage("");
//   // };

//   const handleSend = async () => {
//     if (!newMessage.trim() || !selectedUser) return;
  
//     const chatId = user.uid > selectedUser.uid ? `${user.uid}_${selectedUser.uid}` : `${selectedUser.uid}_${user.uid}`;
  
//     try {
//       await addDoc(collection(db, "messages"), {
//         chatId,
//         senderId: user.uid,
//         receiverId: selectedUser.uid,
//         message: newMessage,
//         timestamp: new Date(),
//       });
//       setNewMessage("");
//     } catch (error) {
//       console.error("Firestore Write Error:", error);
//     }
//   };
  
//   return (
//     <div style={{ display: "flex", height: "100vh" }}>
//       {/* User List */}
//       <div style={{ width: "30%", borderRight: "1px solid #ddd", padding: "10px" }}>
//         <h3>Users</h3>
//         {users
//           .filter((u) => u.uid !== user.uid)
//           .map((u) => (
//             <div key={u.uid} onClick={() => setSelectedUser(u)} style={{ cursor: "pointer", padding: "10px", borderBottom: "1px solid #ddd" }}>
//               {u.name || u.email}
//             </div>
//           ))}
//       </div>

//       {/* Chat Area */}
//       <div style={{ flex: 1, padding: "10px" }}>
//         {selectedUser ? (
//           <>
//             <h3>Chat with {selectedUser.name || selectedUser.email}</h3>
//             <div style={{ height: "60vh", overflowY: "auto", border: "1px solid #ddd", padding: "10px" }}>
//               {messages.map((msg, index) => (
//                 <p key={index} style={{ textAlign: msg.senderId === user.uid ? "right" : "left" }}>
//                   {msg.message}
//                 </p>
//               ))}
//             </div>
//             <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message" />
//             <button onClick={handleSend}>Send</button>
//           </>
//         ) : (
//           <h3>Select a user to start chatting</h3>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Chat;

import React, { useEffect, useState } from "react";
import { db } from "../config/firebase";
import { v4 as uuidv4 } from "uuid";
import { collection, query, where, orderBy, onSnapshot, addDoc, getDocs } from "firebase/firestore";

const Chat = () => {
  const [customerId, setCustomerId] = useState(null);
  const [supportEmployees, setSupportEmployees] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [activeReceiver, setActiveReceiver] = useState(null);

  useEffect(() => {
    // Generate or retrieve temporary customer ID
    let tempId = localStorage.getItem("customerId");
    if (!tempId) {
      tempId = uuidv4();
      localStorage.setItem("customerId", tempId);
    }
    setCustomerId(tempId);
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      const supportRef = collection(db, "users");

      // Fetch support employees
      const supportSnapshot = await getDocs(query(supportRef, where("role", "==", "support")));
      const employees = supportSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setSupportEmployees(employees);

      // Fetch admins
      const adminSnapshot = await getDocs(query(supportRef, where("role", "==", "admin")));
      setAdmins(adminSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (!customerId) return;

    const selectReceiver = async () => {
      let receiver = supportEmployees.find((emp) => emp.isOnline) || admins[0] || null;
      setActiveReceiver(receiver);
    };

    selectReceiver();
  }, [customerId, supportEmployees, admins]);

  useEffect(() => {
    if (!activeReceiver || !customerId) return;

    const chatId = `${customerId}_${activeReceiver.id}`;
    const messagesRef = collection(db, "messages");
    const q = query(messagesRef, where("chatId", "==", chatId), orderBy("timestamp"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => doc.data()));
    });

    return () => unsubscribe();
  }, [activeReceiver, customerId]);

  const handleSend = async () => {
    if (!newMessage.trim() || !activeReceiver || !customerId) return;

    const chatId = `${customerId}_${activeReceiver.id}`;

    try {
      await addDoc(collection(db, "messages"), {
        chatId,
        senderId: customerId,
        receiverId: activeReceiver.id,
        message: newMessage,
        timestamp: new Date(),
      });
      setNewMessage("");
    } catch (error) {
      console.error("Firestore Write Error:", error);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial, sans-serif" }}>
      {/* Chat UI */}
      <div style={{ flex: 1, padding: "10px", maxWidth: "400px", margin: "auto", textAlign: "center" }}>
        <h3>Support Chat</h3>
        {activeReceiver ? (
          <>
            <p>Chatting with: {activeReceiver.name || "Support"}</p>
            <div style={{ height: "60vh", overflowY: "auto", border: "1px solid #ddd", padding: "10px", marginBottom: "10px" }}>
              {messages.map((msg, index) => (
                <p key={index} style={{ textAlign: msg.senderId === customerId ? "right" : "left" }}>
                  <strong>{msg.senderId === customerId ? "You" : "Support"}:</strong> {msg.message}
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
            <button onClick={handleSend} style={{ width: "18%", marginLeft: "2%", padding: "8px" }}>
              Send
            </button>
          </>
        ) : (
          <p>Waiting for support...</p>
        )}
      </div>
    </div>
  );
};

export default Chat;
