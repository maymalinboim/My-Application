import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { isTokenValid } from "@/utils/authUtils";

export default function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    validateToken();
  }, [navigate]);

  const validateToken = () => {
    const token = Cookies.get("Authorization") || "";

    if (!isTokenValid(token)) {
      navigate("/");
    }
  };

  return <div className="h-full w-full">Home Page</div>;
}
