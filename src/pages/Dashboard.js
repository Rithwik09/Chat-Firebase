import React from "react";
import Chat from "../components/chat";
import Logout from "../components/Logout";


const Dashboard = ({ user, onLogout }) => {
  return (
    <div>
      <h2>Welcome, {user?.email}</h2>
      <Logout onLogout={onLogout} />
      <Chat user={user} />
    </div>
  );
};

export default Dashboard;
