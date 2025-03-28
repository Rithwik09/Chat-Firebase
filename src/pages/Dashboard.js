import React from "react";
import Chat from "../components/chat";
import Logout from "../components/Logout";


const Dashboard = ({ user, onLogout  }) => {
  const loggedInUserId = localStorage.getItem("loggedInUserId");
  return (
    <div>
      <h2>Welcome, {user?.email}</h2>
      <Logout onLogout={onLogout} />
      <Chat user={user} loggedInUserId={loggedInUserId} />
    </div>
  );
};

export default Dashboard;
