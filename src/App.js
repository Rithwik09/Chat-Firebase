import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { auth } from "./config/firebase";
import Login from "./auth/Login";
import Signup from "./auth/Signup";
import Dashboard from "./pages/Dashboard";
import NewChat from "./pages/newchat";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <Dashboard user={user} /> : <Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/customer" element={<NewChat />} />
      </Routes>
    </Router>
  );
}

export default App;
