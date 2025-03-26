import {useState, useEffect} from "react";
import { db } from "../config/firebase"; 
import {collection, query, where, orderBy, onSnapshot, addDoc, getDocs} from "firebase/firestore";
import {v4 as uuidv4} from "uuid";

const CustomerChat = () => {
    const [customerId, setCustomerId] = useState(localStorage.getItem("customerId") || uuidv4());
    const [supportAgents, setSupportAgents] = useState([]);
    const [selectedSupport, setSelectedSupport] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    useEffect(() => {
        // Save customerId in localStorage
        localStorage.setItem("customerId", customerId);

        // Fetch available support agents
        const fetchSupportAgents = async () => {
            const supportRef = collection(db, "users"); // Assuming support agents are stored here
            const q = query(supportRef, where("role", "==", "support")); // Filtering only support agents
            const snapshot = await getDocs(q);
            const agents = snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));

            setSupportAgents(agents);
            console.log("support agents",agents);    
            // Select the first available support agent
            if (agents.length > 0) {
                setSelectedSupport(agents[0]);
            } else {
                // If no support agents, assign to an admin
                const adminRef = query(supportRef, where("role", "==", "admin"));
                const adminSnapshot = await getDocs(adminRef);
                const admins = adminSnapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
                if (admins.length > 0) {
                    setSelectedSupport(admins[0]);
                }
            }
        };
        fetchSupportAgents();
    }, []);

    useEffect(() => {
        if (!selectedSupport) return;

        // Fetch chat messages
        const chatId = `${customerId}_${selectedSupport.id}`;
        const messagesRef = collection(db, "messages");
        const q = query(messagesRef, where("chatId", "==", chatId), orderBy("timestamp"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setMessages(snapshot.docs.map((doc) => doc.data()));
        });

        return () => unsubscribe();
    }, [selectedSupport, customerId]);

    const handleSend = async () => {
        if (!newMessage.trim() || !selectedSupport) return;

        const chatId = `${customerId}_${selectedSupport.id}`;

        try {
            await addDoc(collection(db, "messages"), {
                chatId,
                senderId: customerId,
                receiverId: selectedSupport.id,
                message: newMessage,
                timestamp: new Date(),
            });
            setNewMessage("");
        } catch (error) {
            console.error("Firestore Write Error:", error);
        }
    };

    return (
        <div style={{padding: "20px", maxWidth: "400px", border: "1px solid #ddd"}}>
            <h3>Chat with Support</h3>
            <div style={{height: "300px", overflowY: "auto", border: "1px solid #ddd", padding: "10px"}}>
                {messages.map((msg, index) => (
                    <p key={index} style={{textAlign: msg.senderId === customerId ? "right" : "left"}}>
                        <strong>{msg.senderId === customerId ? "You" : "Support"}:</strong> {msg.message}
                    </p>
                ))}
            </div>
            <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                style={{width: "100%", padding: "8px", marginTop: "10px"}}
            />
            <button onClick={handleSend} style={{width: "100%", marginTop: "5px", padding: "8px"}}>
                Send
            </button>
        </div>
    );
};

export default CustomerChat;
