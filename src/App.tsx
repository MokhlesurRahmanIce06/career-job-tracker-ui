import { useState } from "react";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

import {
  getAccessToken,
  logout,
} from "./auth/githubAuth";

function App() {
  const [authenticated, setAuthenticated] =
    useState<boolean>(() => {
      return !!getAccessToken();
    });

  const handleLoginSuccess = () => {
    setAuthenticated(true);
  };

  const handleLogout = () => {
    logout();
    setAuthenticated(false);
  };

  if (!authenticated) {
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <Dashboard
      onLogout={handleLogout}
    />
  );
}

export default App;