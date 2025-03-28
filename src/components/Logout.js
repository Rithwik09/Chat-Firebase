import React from "react";
import {signOut} from "firebase/auth";
import {auth, db} from "../config/firebase";
import {doc, updateDoc} from "firebase/firestore";

const Logout = ({onLogout}) => {
    const handleLogout = async () => {
        try {
            const user = auth.currentUser;
            if (user) {
                const userRef = doc(db, "users", user.uid);
                await updateDoc(userRef, {isOnline: false});
            }
            localStorage.clear();
            await signOut(auth);
            alert("Logged out successfully!");
            onLogout();
            console.log("Logged out successfully!");
        } catch (err) {
            console.error("Logout Error:", err);
        }
    };

    return <button onClick={handleLogout}>Logout</button>;
};

export default Logout;
