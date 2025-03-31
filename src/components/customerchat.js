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
//         let q = query(supportRef, where("role", "==", "support"), where("isOnline", "==", true));
//         let snapshot = await getDocs(q);
//         let agents = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        
//         if (agents.length === 0) {
//             q = query(supportRef, where("role", "==", "admin"));
//             snapshot = await getDocs(q);
//             agents = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
//         }

//         if (agents.length > 0) {
//             const chosenSupport = agents[0];
//             setSelectedSupport(chosenSupport);
//             setChatStarted(true);

//             const supportDocRef = doc(db, "users", chosenSupport.id);
//             let activeChats = chosenSupport.activeChats || [];
            
//             // Ensure activeChats is unique
//             if (!activeChats.includes(customerId)) {
//                 await updateDoc(supportDocRef, {
//                     activeChats: [...activeChats, customerId],
//                 });
//             }
//         }
//     };

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

//     const handleEndChat = async () => {
//         if (!selectedSupport) return;
//         const supportDocRef = doc(db, "users", selectedSupport.id);
//         let activeChats = selectedSupport.activeChats || [];
        
//         // Remove customerId from activeChats
//         activeChats = activeChats.filter(id => id !== customerId);
//         await updateDoc(supportDocRef, { activeChats });

//         setSelectedSupport(null);
//         setChatStarted(false);
//         setMessages([]);
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
//                             <p key={index} style={{ background: msg.senderId === customerId ? "#d1e7dd" : "#f8d7da", padding: "8px", borderRadius: "5px", marginBottom: "5px" }}>
//                                 <strong>{msg.senderId === customerId ? "You" : "Support"}:</strong> {msg.text}
//                             </p>
//                         ))}
//                     </div>
//                     <input style={{ width: "50%", padding: "8px", marginBottom: "10px" }} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
//                     <button onClick={handleSend} style={{ padding: "8px 16px", cursor: "pointer", marginRight: "10px" }}>Send</button>
//                     <button onClick={handleEndChat} style={{ padding: "8px 16px", cursor: "pointer", backgroundColor: "red", color: "white" }}>End Chat</button>
//                 </>
//             )}
//         </div>
//     );
// };

// export default CustomerChat;

// import { useState, useEffect } from "react";
// import { db, auth } from "../config/firebase";
// import {
//     collection,
//     query,
//     where,
//     doc,
//     getDoc,
//     setDoc,
//     addDoc, 
//     // getDocs,
//     updateDoc,
//     onSnapshot,
//     orderBy,
// } from "firebase/firestore";
// import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
// // import { v4 as uuidv4 } from "uuid";
// import Logout from "./Logout";

// const CustomerChat = () => {
//     const [user, setUser] = useState(null);
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [isSignUp, setIsSignUp] = useState(false);
//     const [selectedSupport, setSelectedSupport] = useState(null);
//     const [messages, setMessages] = useState([]);
//     const [newMessage, setNewMessage] = useState("");
//     const [chatStarted, setChatStarted] = useState(false);

//     useEffect(() => {
//         onAuthStateChanged(auth, async (currentUser) => {
//             if (currentUser) {
//                 const userDoc = await getDoc(doc(db, "users", currentUser.uid));
//                 if (userDoc.exists() && userDoc.data().role === "customer") {
//                     setUser(currentUser);
//                 } else {
//                     setUser(null);
//                 }
//             } else {
//                 setUser(null);
//             }
//         });
//     }, []);

//     const handleAuth = async () => {
//         try {
//             if (isSignUp) {
//                 const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//                 const newUser = userCredential.user;
//                 await setDoc(doc(db, "users", newUser.uid), {
//                     email: newUser.email,
//                     role: "customer",
//                     createdAt: new Date(),
//                 });
//                 setUser(newUser);
//             } else {
//                 const userCredential = await signInWithEmailAndPassword(auth, email, password);
//                 const loggedInUser = userCredential.user;
//                 const userDoc = await getDoc(doc(db, "users", loggedInUser.uid));
    
//                 if (!userDoc.exists()) {
//                     console.error("Login failed: User not found.");
//                     return;
//                 }
    
//                 const userData = userDoc.data();
//                 if (userData.role === "customer") {
//                     setUser(loggedInUser);
//                 } else {
//                     console.error("Login failed: Only customers can log in.");
//                     return;
//                 }
//             }
//         } catch (error) {
//             console.error("Authentication Error:", error.message);
//         }
//     };
    

//     // const handleAuth = async () => {
//     //     try {
//     //         if (isSignUp) {
//     //             const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//     //             const newUser = userCredential.user;
//     //             await setDoc(doc(db, "users", newUser.uid), {
//     //                 email: newUser.email,
//     //                 role: "customer",
//     //             });
//     //             setUser(newUser);
//     //         } else {
//     //             const userCredential = await signInWithEmailAndPassword(auth, email, password);
//     //             const loggedInUser = userCredential.user;
//     //             const userDoc = await getDoc(doc(db, "users", loggedInUser.uid));
//     //             if (userDoc.exists() && userDoc.data().role === "customer") {
//     //                 setUser(loggedInUser);
//     //             } else {
//     //                 console.error("Login failed: User is not a customer.");
//     //             }
//     //         }
//     //     } catch (error) {
//     //         console.error("Authentication Error:", error);
//     //     }
//     // };

//     // const initiateChat = async () => {
//     //     const supportRef = collection(db, "users");
//     //     let q = query(supportRef, where("role", "==", "support"), where("isOnline", "==", true));
//     //     let snapshot = await getDocs(q);
//     //     let agents = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        
//     //     if (agents.length === 0) {
//     //         q = query(supportRef, where("role", "==", "admin"));
//     //         snapshot = await getDocs(q);
//     //         agents = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
//     //     }

//     //     if (agents.length > 0) {
//     //         const chosenSupport = agents[0];
//     //         setSelectedSupport(chosenSupport);
//     //         setChatStarted(true);

//     //         const supportDocRef = doc(db, "users", chosenSupport.id);
//     //         let activeChats = chosenSupport.activeChats || [];
            
//     //         if (!activeChats.includes(user.uid)) {
//     //             await updateDoc(supportDocRef, {
//     //                 activeChats: [...activeChats, user.uid],
//     //             });
//     //         }
//     //     }
//     // };


//     const initiateChat = async () => {
//         const chatId = user ? user.uid : `guest_${Date.now()}`;
//         setChatStarted(true);
    
//         const chatRef = doc(db, "chats", chatId);
//         const chatSnap = await getDoc(chatRef);
    
//         if (!chatSnap.exists()) {
//             await setDoc(chatRef, {
//                 customerId: chatId,
//                 participants: [chatId], // Initially just the customer
//                 lastMessage: "",
//                 lastUpdated: new Date(),
//                 isGuest: !user, // True if user is null
//             });
//         }
//     };

    
//     // useEffect(() => {
//     //     if (!selectedSupport) return;
//     //     const chatId = `${user.uid}_${selectedSupport.id}`;
//     //     const chatRef = doc(db, "chats", chatId);

//     //     const unsubscribe = onSnapshot(chatRef, (snapshot) => {
//     //         if (snapshot.exists()) {
//     //             setMessages(snapshot.data().messages || []);
//     //         } else {
//     //             setMessages([]);
//     //         }
//     //     });

//     //     return () => unsubscribe();
//     // }, [selectedSupport, user]);

//     useEffect(() => {
//         if (!chatStarted) return;
        
//         const chatId = user ? user.uid : `guest_${Date.now()}`;
//         const messagesRef = collection(db, "messages");
//         const q = query(messagesRef, where("chatId", "==", chatId), orderBy("timestamp", "asc"));
    
//         const unsubscribe = onSnapshot(q, (snapshot) => {
//             const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//             setMessages(msgs);
//         });
    
//         return () => unsubscribe();
//     }, [chatStarted]);

    
//     // const handleSend = async () => {
//     //     if (!newMessage.trim() || !selectedSupport) return;
//     //     const chatId = `${user.uid}_${selectedSupport.id}`;
//     //     const chatRef = doc(db, "chats", chatId);
//     //     const newMsg = {
//     //         senderId: user.uid,
//     //         text: newMessage,
//     //         timestamp: new Date(),
//     //     };

//     //     try {
//     //         const chatSnap = await getDoc(chatRef);
//     //         if (chatSnap.exists()) {
//     //             await updateDoc(chatRef, {
//     //                 messages: [...chatSnap.data().messages, newMsg],
//     //             });
//     //         } else {
//     //             await setDoc(chatRef, {
//     //                 participants: [user.uid, selectedSupport.id],
//     //                 messages: [newMsg],
//     //             });
//     //         }
//     //         setNewMessage("");
//     //     } catch (error) {
//     //         console.error("Firestore Write Error:", error);
//     //     }
//     // };

//     const handleSend = async () => {
//         if (!newMessage.trim()) return;
    
//         const chatId = user ? user.uid : `guest_${Date.now()}`;
//         const messageRef = collection(db, "messages");
    
//         const newMsg = {
//             chatId,
//             senderId: user ? user.uid : "guest",
//             text: newMessage,
//             timestamp: new Date(),
//         };
    
//         try {
//             await addDoc(messageRef, newMsg);
    
//             // Update the `chats/` collection with the last message
//             const chatRef = doc(db, "chats", chatId);
//             await updateDoc(chatRef, {
//                 lastMessage: newMessage,
//                 lastUpdated: new Date(),
//             });
    
//             setNewMessage("");
//         } catch (error) {
//             console.error("Firestore Write Error:", error);
//         }
//     };

    
//     const handleLogout = () => {
//         setUser(null);
//         setChatStarted(false);
//         setSelectedSupport(null);
//         setMessages([]);
//     };

//     return (
//         <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
//             {!user ? (
//                 <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
//                     <h2>{isSignUp ? "Sign Up" : "Login"}</h2>
//                     <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
//                     <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
//                     <button onClick={handleAuth}>{isSignUp ? "Sign Up" : "Login"}</button>
//                     <button onClick={() => setIsSignUp(!isSignUp)}>
//                         {isSignUp ? "Already have an account? Login" : "Don't have an account? Sign Up"}
//                     </button>
//                 </div>
//             ) : !chatStarted ? (
//                 <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
//                 <Logout onLogout={handleLogout} />
//                 <span>Welcome, {user.email}</span>
//                 <button onClick={initiateChat}>Chat with Us</button>
//                 </div>
//             ) : (
//                 <div>
//                     <h2>Customer Support Chat</h2>
//                     <Logout onLogout={handleLogout} />
//                     <div style={{ width: "75%", height: "270px", overflowY: "auto", border: "1px solid #ccc", padding: "10px", margin: "10px 0" }}>
//                         {messages.map((msg, index) => (
//                             <p key={index} style={{ background: msg.senderId === user.uid ? "#d1e7dd" : "#f8d7da", padding: "3px", borderRadius: "3px", marginBottom: "3px" }}>
//                                 <strong>{msg.senderId === user.uid ? "You" : "Support"}:</strong> {msg.text}
//                             </p>
//                         ))}
//                     </div>
//                     <div style={{display: "flex" , gap: "10px"}} >
//                     <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
//                     <button onClick={handleSend}>Send</button>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default CustomerChat;

import { useState, useEffect } from "react";
import { db, auth } from "../config/firebase";
import {
    collection,
    query,
    where,
    doc,
    getDoc,
    setDoc,
    addDoc,
    updateDoc,
    onSnapshot,
    orderBy,
} from "firebase/firestore";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import Logout from "./Logout";

const CustomerChat = () => {
    const [user, setUser] = useState(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSignUp, setIsSignUp] = useState(false);
    const [chatId, setChatId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [chatStarted, setChatStarted] = useState(false);

    useEffect(() => {
        onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                if (userDoc.exists()) {
                    setUser({ ...currentUser, role: userDoc.data().role });
                } else {
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        });
    }, []);

    const handleAuth = async () => {
        try {
            if (isSignUp) {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const newUser = userCredential.user;
                await setDoc(doc(db, "users", newUser.uid), {
                    email: newUser.email,
                    role: "customer",
                    createdAt: new Date(),
                });
                setUser(newUser);
            } else {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const loggedInUser = userCredential.user;
                const userDoc = await getDoc(doc(db, "users", loggedInUser.uid));
                if (userDoc.exists()) {
                    setUser({ ...loggedInUser, role: userDoc.data().role });
                }
            }
        } catch (error) {
            console.error("Authentication Error:", error.message);
        }
    };

    const initiateChat = async () => {
        const customerId = user ? user.uid : `guest_${Date.now()}`;
        setChatId(customerId);
        setChatStarted(true);

        const chatRef = doc(db, "chats", customerId);
        const chatSnap = await getDoc(chatRef);

        if (!chatSnap.exists()) {
            await setDoc(chatRef, {
                customerId,
                lastMessage: "",
                lastUpdated: new Date(),
                isGuest: !user,
            });
        }
    };

    useEffect(() => {
        if (!chatStarted || !chatId) return;

        const messagesRef = collection(db, "messages");
        const q = query(messagesRef, where("chatId", "==", chatId), orderBy("timestamp", "asc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => unsubscribe();
    }, [chatStarted, chatId]);

    const handleSend = async () => {
        if (!newMessage.trim()) return;

        const messageRef = collection(db, "messages");
        const newMsg = {
            chatId,
            senderId: user ? user.uid : "guest",
            text: newMessage,
            timestamp: new Date(),
        };

        try {
            await addDoc(messageRef, newMsg);
            await updateDoc(doc(db, "chats", chatId), {
                lastMessage: newMessage,
                lastUpdated: new Date(),
            });
            setNewMessage("");
        } catch (error) {
            console.error("Firestore Write Error:", error);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {!user ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                    <h2>{isSignUp ? "Sign Up" : "Login"}</h2>
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button onClick={handleAuth}>{isSignUp ? "Sign Up" : "Login"}</button>
                    <button onClick={() => setIsSignUp(!isSignUp)}>{isSignUp ? "Already have an account? Login" : "Don't have an account? Sign Up"}</button>
                </div>
            ) : !chatStarted ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                    <Logout onLogout={() => setUser(null)} />
                    <span>Welcome, {user.email}</span>
                    <button onClick={initiateChat}>Chat with Us</button>
                </div>
            ) : (
                <div>
                    <h2>Customer Support Chat</h2>
                    <Logout onLogout={() => setUser(null)} />
                    <div style={{ width: "75%", height: "270px", overflowY: "auto", border: "1px solid #ccc", padding: "10px", margin: "10px 0" }}>
                        {messages.map((msg, index) => (
                            <p key={index} style={{ background: msg.senderId === user.uid ? "#d1e7dd" : "#f8d7da", padding: "3px", borderRadius: "3px", marginBottom: "3px" }}>
                                <strong>{msg.senderId === user.uid ? "You" : "Support"}:</strong> {msg.text}
                            </p>
                        ))}
                    </div>
                    <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                    <button onClick={handleSend}>Send</button>
                </div>
            )}
        </div>
    );
};

export default CustomerChat;
