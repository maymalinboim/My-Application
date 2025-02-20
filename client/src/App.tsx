import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import AuthPage from "./pages/Login";
import ProfilePage from "./pages/Profile";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} /> {/* Home page */}
        <Route path="/profile" element={<ProfilePage />} /> {/* Dashboard */}
      </Routes>
    </Router>
  );
}

export default App;
