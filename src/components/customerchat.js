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
import { formatDistanceToNow } from "date-fns";
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
                
                // Set user role as "customer"
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
                    const userData = userDoc.data();
    
                    if (userData.role !== "customer") {
                        console.error("Access Denied: Only customers can log in.");
                        alert("Access Denied: Only customers can log in.");
                        setChatStarted(false);
                        return; 
                    }
    
                    setUser({ ...loggedInUser, role: userData.role });
                } else {
                    console.error("User record not found.");
                    alert("User record not found.");
                }
            }
        } catch (error) {
            console.error("Authentication Error:", error.message);
        }
    };    

    // const initiateChat = async (isGuest = false) => {
    //     let customerId;
        
    //     if (isGuest) {
    //         // Generate a unique guest ID
    //         customerId = `guest_${Date.now()}`;
    //         setUser({ uid: customerId, role: "guest" });

    //         // Store guest user in Firestore
    //         await setDoc(doc(db, "users", customerId), {
    //             role: "guest",
    //             createdAt: new Date(),
    //         });
    //     } else {
    //         customerId = user.uid;
    //     }

    //     setChatId(customerId);
    //     setChatStarted(true);

    //     const chatRef = doc(db, "chats", customerId);
    //     const chatSnap = await getDoc(chatRef);

    //     if (!chatSnap.exists()) {
    //         await setDoc(chatRef, {
    //             customerId,
    //             lastMessage: "",
    //             lastUpdated: new Date(),
    //             isGuest: isGuest,
    //         });
    //     }
    // };

    const initiateChat = async (isGuest = false) => {
        let customerId;
        
        if (isGuest) {
            // Retrieve guest ID from localStorage if available
            customerId = localStorage.getItem("guestId");
    
            if (!customerId) {
                // Generate a new guest ID and save it in localStorage
                customerId = `guest_${Date.now()}`;
                localStorage.setItem("guestId", customerId);
    
                // Store guest user in Firestore only if it's a new guest
                await setDoc(doc(db, "users", customerId), {
                    role: "guest",
                    createdAt: new Date(),
                });
            }
    
            setUser({ uid: customerId, role: "guest" });
    
        } else {
            customerId = user.uid;
        }
    
        setChatId(customerId);
        setChatStarted(true);
    
        const chatRef = doc(db, "chats", customerId);
        const chatSnap = await getDoc(chatRef);
    
        if (!chatSnap.exists()) {
            await setDoc(chatRef, {
                customerId,
                lastMessage: "",
                lastUpdated: new Date(),
                isGuest: isGuest,
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
        <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
            {!user ? (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "10px",
                        width: "300px",
                    }}
                >
                    <h2>{isSignUp ? "Sign Up" : "Login"}</h2>
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button onClick={handleAuth}>{isSignUp ? "Sign Up" : "Login"}</button>
                    <button onClick={() => setIsSignUp(!isSignUp)}>
                        {isSignUp ? "Already have an account? Login" : "Don't have an account? Sign Up"}
                    </button>
                    <button onClick={() => initiateChat(true)}>Chat Without Login</button>{" "}
                </div>
            ) : !chatStarted ? (
                <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "10px"}}>
                    <Logout onLogout={() => setUser(null)} />
                    <span>Welcome, {user.role === "guest" ? "Guest User" : user.email}</span>
                    <button onClick={() => initiateChat(false)}>Chat with Us</button>
                </div>
            ) : (
                <div style={{width: "50%"}}>
                    <h2>Customer Support Chat</h2>
                    <Logout onLogout={() => setUser(null)} />
                    <div
                        style={{
                            width: "75%",
                            height: "270px",
                            overflowY: "auto",
                            border: "1px solid #ccc",
                            padding: "10px",
                            margin: "10px 0",
                        }}
                    >
                        {messages.map((msg, index) => (
                            <p
                                key={index}
                                style={{
                                    background: msg.senderId === user.uid ? "#d1e7dd" : "#f8d7da",
                                    padding: "3px",
                                    borderRadius: "3px",
                                    marginBottom: "3px",
                                }}
                            >
                                <strong>{msg.senderId === user.uid ? "You" : "Support"}:</strong> {msg.text}
                                <span style={{fontSize: "12px", color: "gray", marginLeft: "10px"}}>
                                    {formatDistanceToNow(new Date(msg.timestamp.seconds * 1000), {addSuffix: true})}
                                </span>
                            </p>
                        ))}
                    </div>
                    <input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        style={{width: "76%", padding: "5px", marginBottom: "10px"}}
                    />
                    <button onClick={handleSend} style={{width: "100px", height: "30px", marginLeft: "10px"}}>
                        Send
                    </button>
                </div>
            )}
        </div>
    );
};

export default CustomerChat;
