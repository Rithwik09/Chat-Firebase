import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase";

const Logout = ({ onLogout }) => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("Logged out successfully!");
      onLogout(); // Call the parent function to update state
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return <button onClick={handleLogout}>Logout</button>;
};

export default Logout;
