import "./App.css";
import AuthPage from "./pages/Login";
import ProfilePage from "./pages/Profile";
import Cookies from "js-cookie";
import { isTokenValid } from "./utils/authUtils";

function App() {
  const token = Cookies.get("Authorization") || "";

  return <>{isTokenValid(token) ? <ProfilePage /> : <AuthPage />}</>;
}

export default App;
