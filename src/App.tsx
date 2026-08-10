import { useState } from "react";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function App() {
  const [authenticated] = useState(false);

  if (!authenticated) {
    return <Login />;
  }

  return <Dashboard />;
}

export default App;