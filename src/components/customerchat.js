// import { useState, useEffect } from "react";
// import { db } from "../config/firebase";
// import { collection, query, where, doc, getDoc, setDoc, getDocs, updateDoc, onSnapshot } from "firebase/firestore";
// import { v4 as uuidv4 } from "uuid";

// const CustomerChat = () => {
//     const [customerId, setCustomerId] = useState(localStorage.getItem("customerId") || uuidv4());
//     const [supportAgents, setSupportAgents] = useState([]);
//     const [selectedSupport, setSelectedSupport] = useState(null);
//     const [messages, setMessages] = useState([]);
//     const [newMessage, setNewMessage] = useState("");

//     useEffect(() => {
//         localStorage.setItem("customerId", customerId);

//         const fetchSupportAgents = async () => {
//             const supportRef = collection(db, "users");
//             const q = query(supportRef, where("role", "in", ["support", "admin"]));
//             const snapshot = await getDocs(q);
//             const agents = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

//             if (agents.length > 0) {
//                 setSupportAgents(agents);
//                 setSelectedSupport(agents[0]);
//             }
//         };
//         fetchSupportAgents();
//     }, [customerId]);

//     useEffect(() => {
//         if (!selectedSupport) return;

//         const chatId = `${customerId}_${selectedSupport.id}`;
//         const chatRef = doc(db, "chats", chatId);

//         const unsubscribe = onSnapshot(chatRef, (snapshot) => {
//             if (snapshot.exists()) {
//                 setMessages(snapshot.data().messages || []);
//             } else {
//                 setMessages([]);
//             }
//         });

//         return () => unsubscribe();
//     }, [selectedSupport, customerId]);

//     const handleSend = async () => {
//         if (!newMessage.trim() || !selectedSupport) return;

//         const chatId = `${customerId}_${selectedSupport.id}`;
//         const chatRef = doc(db, "chats", chatId);
//         const newMsg = { senderId: customerId, text: newMessage, timestamp: new Date() };

//         try {
//             const chatSnap = await getDoc(chatRef);

//             if (chatSnap.exists()) {
//                 await updateDoc(chatRef, {
//                     messages: [...chatSnap.data().messages, newMsg],
//                 });
//             } else {
//                 await setDoc(chatRef, {
//                     participants: [customerId, selectedSupport.id],
//                     messages: [newMsg],
//                 });
//             }

//             setNewMessage("");
//         } catch (error) {
//             console.error("Firestore Write Error:", error);
//         }
//     };

//     return (
//         <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh" }}>
//             <h2>Customer Support Chat</h2>
//             <div>
//             </div>
//             <div style={{ width: "50%", height: "400px", overflowY: "auto", border: "1px solid #ccc", padding: "10px", margin: "10px 0" }}>
//                 {messages.map((msg, index) => (
//                     <p key={index} style={{ background: msg.senderId === customerId ? "#d1e7dd" : "#f8d7da", padding: "8px", borderRadius: "5px", marginBottom: "5px" }}>
//                         <strong>{msg.senderId === customerId ? "You" : "Support"}:</strong> {msg.text}
//                     </p>
//                 ))}
//             </div>
//             <input style={{ width: "40%", padding: "8px", marginBottom: "10px" }} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
//             <button onClick={handleSend} style={{ padding: "8px 16px", cursor: "pointer" }}>Send</button>
//         </div>
//     );
// };

// export default CustomerChat;


// import { useState, useEffect } from "react";
// import { db } from "../config/firebase";
// import {
//     collection,
//     query,
//     where,
//     doc,
//     getDoc,
//     setDoc,
//     getDocs,
//     updateDoc,
//     onSnapshot,
// } from "firebase/firestore";
// import { v4 as uuidv4 } from "uuid";

// const CustomerChat = () => {
//     const [customerId, setCustomerId] = useState(localStorage.getItem("customerId") || uuidv4());
//     const [selectedSupport, setSelectedSupport] = useState(null);
//     const [messages, setMessages] = useState([]);
//     const [newMessage, setNewMessage] = useState("");
//     const [chatStarted, setChatStarted] = useState(false);

//     useEffect(() => {
//         localStorage.setItem("customerId", customerId);
//     }, [customerId]);

//     const initiateChat = async () => {
//         const supportRef = collection(db, "users");
//         console.log("support avaliable",supportRef);
//         // Fetch available online support agents first
//         let q = query(supportRef, where("role", "==", "support"), where("isOnline", "==", true));
//         console.log("q",q); 
//         let snapshot = await getDocs(q);
//         let agents = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
//         console.log("agents",agents);   
//         // If no online support agents are found, select an admin
//         if (agents.length === 0) {
//             q = query(supportRef, where("role", "==", "admin"));
//             snapshot = await getDocs(q);
//             agents = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
//         }

//         if (agents.length > 0) {
//             const chosenSupport = agents[0];
//             setSelectedSupport(chosenSupport);
//             setChatStarted(true);

//             // Notify the support agent that a new chat has started
//             const supportRef = doc(db, "users", chosenSupport.id);
//             await updateDoc(supportRef, {
//                 activeChats: [...(chosenSupport.activeChats || []), customerId],
//             });
//         }
//     };

//     useEffect(() => {
//         if (!selectedSupport) return;

//         const chatId = `${customerId}_${selectedSupport.id}`;
//         const chatRef = doc(db, "chats", chatId);

//         // Listen for messages in real-time
//         const unsubscribe = onSnapshot(chatRef, (snapshot) => {
//             if (snapshot.exists()) {
//                 setMessages(snapshot.data().messages || []);
//             } else {
//                 setMessages([]);
//             }
//         });

//         return () => unsubscribe();
//     }, [selectedSupport, customerId]);

//     const handleSend = async () => {
//         if (!newMessage.trim() || !selectedSupport) return;

//         const chatId = `${customerId}_${selectedSupport.id}`;
//         const chatRef = doc(db, "chats", chatId);
//         const newMsg = {
//             senderId: customerId,
//             text: newMessage,
//             timestamp: new Date(),
//         };

//         try {
//             const chatSnap = await getDoc(chatRef);

//             if (chatSnap.exists()) {
//                 await updateDoc(chatRef, {
//                     messages: [...chatSnap.data().messages, newMsg],
//                 });
//             } else {
//                 await setDoc(chatRef, {
//                     participants: [customerId, selectedSupport.id],
//                     messages: [newMsg],
//                 });
//             }

//             setNewMessage("");
//         } catch (error) {
//             console.error("Firestore Write Error:", error);
//         }
//     };

//     return (
//         <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh" }}>
//             <h2>Customer Support Chat</h2>

//             {!chatStarted ? (
//                 <button onClick={initiateChat} style={{ padding: "10px 20px", cursor: "pointer", marginBottom: "20px" }}>
//                     Chat with Us
//                 </button>
//             ) : (
//                 <>
//                     <div style={{ width: "50%", height: "400px", overflowY: "auto", border: "1px solid #ccc", padding: "10px", margin: "10px 0" }}>
//                         {messages.map((msg, index) => (
//                             <p
//                                 key={index}
//                                 style={{
//                                     background: msg.senderId === customerId ? "#d1e7dd" : "#f8d7da",
//                                     padding: "8px",
//                                     borderRadius: "5px",
//                                     marginBottom: "5px",
//                                 }}
//                             >
//                                 <strong>{msg.senderId === customerId ? "You" : "Support"}:</strong> {msg.text}
//                             </p>
//                         ))}
//                     </div>
//                     <input
//                         style={{ width: "50%", padding: "8px", marginBottom: "10px" }}
//                         value={newMessage}
//                         onChange={(e) => setNewMessage(e.target.value)}
//                     />
//                     <button onClick={handleSend} style={{ padding: "8px 16px", cursor: "pointer" }}>Send</button>
//                 </>
//             )}
//         </div>
//     );
// };

// export default CustomerChat;    


import { useState, useEffect } from "react";
import { db } from "../config/firebase";
import {
    collection,
    query,
    where,
    doc,
    getDoc,
    setDoc,
    getDocs,
    updateDoc,
    onSnapshot,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

const CustomerChat = () => {
    const [customerId, setCustomerId] = useState(localStorage.getItem("customerId") || uuidv4());
    const [selectedSupport, setSelectedSupport] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [chatStarted, setChatStarted] = useState(false);

    useEffect(() => {
        localStorage.setItem("customerId", customerId);
    }, [customerId]);

    const initiateChat = async () => {
        const supportRef = collection(db, "users");
        let q = query(supportRef, where("role", "==", "support"), where("isOnline", "==", true));
        let snapshot = await getDocs(q);
        let agents = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        
        if (agents.length === 0) {
            q = query(supportRef, where("role", "==", "admin"));
            snapshot = await getDocs(q);
            agents = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        }

        if (agents.length > 0) {
            const chosenSupport = agents[0];
            setSelectedSupport(chosenSupport);
            setChatStarted(true);

            const supportDocRef = doc(db, "users", chosenSupport.id);
            let activeChats = chosenSupport.activeChats || [];
            
            // Ensure activeChats is unique
            if (!activeChats.includes(customerId)) {
                await updateDoc(supportDocRef, {
                    activeChats: [...activeChats, customerId],
                });
            }
        }
    };

    useEffect(() => {
        if (!selectedSupport) return;
        const chatId = `${customerId}_${selectedSupport.id}`;
        const chatRef = doc(db, "chats", chatId);

        const unsubscribe = onSnapshot(chatRef, (snapshot) => {
            if (snapshot.exists()) {
                setMessages(snapshot.data().messages || []);
            } else {
                setMessages([]);
            }
        });

        return () => unsubscribe();
    }, [selectedSupport, customerId]);

    const handleSend = async () => {
        if (!newMessage.trim() || !selectedSupport) return;
        const chatId = `${customerId}_${selectedSupport.id}`;
        const chatRef = doc(db, "chats", chatId);
        const newMsg = {
            senderId: customerId,
            text: newMessage,
            timestamp: new Date(),
        };

        try {
            const chatSnap = await getDoc(chatRef);
            if (chatSnap.exists()) {
                await updateDoc(chatRef, {
                    messages: [...chatSnap.data().messages, newMsg],
                });
            } else {
                await setDoc(chatRef, {
                    participants: [customerId, selectedSupport.id],
                    messages: [newMsg],
                });
            }
            setNewMessage("");
        } catch (error) {
            console.error("Firestore Write Error:", error);
        }
    };

    const handleEndChat = async () => {
        if (!selectedSupport) return;
        const supportDocRef = doc(db, "users", selectedSupport.id);
        let activeChats = selectedSupport.activeChats || [];
        
        // Remove customerId from activeChats
        activeChats = activeChats.filter(id => id !== customerId);
        await updateDoc(supportDocRef, { activeChats });

        setSelectedSupport(null);
        setChatStarted(false);
        setMessages([]);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh" }}>
            <h2>Customer Support Chat</h2>
            {!chatStarted ? (
                <button onClick={initiateChat} style={{ padding: "10px 20px", cursor: "pointer", marginBottom: "20px" }}>
                    Chat with Us
                </button>
            ) : (
                <>
                    <div style={{ width: "50%", height: "400px", overflowY: "auto", border: "1px solid #ccc", padding: "10px", margin: "10px 0" }}>
                        {messages.map((msg, index) => (
                            <p key={index} style={{ background: msg.senderId === customerId ? "#d1e7dd" : "#f8d7da", padding: "8px", borderRadius: "5px", marginBottom: "5px" }}>
                                <strong>{msg.senderId === customerId ? "You" : "Support"}:</strong> {msg.text}
                            </p>
                        ))}
                    </div>
                    <input style={{ width: "50%", padding: "8px", marginBottom: "10px" }} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                    <button onClick={handleSend} style={{ padding: "8px 16px", cursor: "pointer", marginRight: "10px" }}>Send</button>
                    <button onClick={handleEndChat} style={{ padding: "8px 16px", cursor: "pointer", backgroundColor: "red", color: "white" }}>End Chat</button>
                </>
            )}
        </div>
    );
};

export default CustomerChat;
