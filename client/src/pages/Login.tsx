import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loginUser, registerUser } from "@/actions/authActions";
import { isTokenValid } from "@/utils/authUtils";

interface AuthForm {
  username: string;
  email?: string;
  password: string;
}

export default function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [generalError, setGeneralError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthForm>();

  useEffect(() => {
    validateToken();
  }, [navigate]);

  const validateToken = () => {
    const token = Cookies.get("Authorization") || "";

    if (isTokenValid(token)) {
      navigate("/profile");
    }
  };

  const onSubmit = async (data: AuthForm) => {
    try {
      if (isLogin) {
        await loginUser(data.username, data.password);
      } else {
        await registerUser(data.username, data.email || "", data.password);
      }

      validateToken();
    } catch (error: any) {
      if (error.status === 401) {
        setGeneralError("Incorrect credentials");
      } else {
        setGeneralError(error.response.data.error || "Internal error");
      }
    }
  };

  const errorClass = "text-red-500 text-xs w-fit ml-1 mt-1";

  return (
    <div className="flex items-center justify-center bg-gray-100 rounded w-1/3 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-xl font-bold p-3">
            {isLogin ? "Login" : "Register"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input
                type="username"
                placeholder="Username"
                {...register("username", { required: "Username is required" })}
                className="w-full"
              />
              {errors.username && (
                <p className={errorClass}>{errors.username.message}</p>
              )}
            </div>
            {!isLogin && (
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  {...register("email", { required: "Email is required" })}
                  className="w-full"
                />
                {errors.email && (
                  <p className={errorClass}>{errors.email.message}</p>
                )}
              </div>
            )}
            <div>
              <Input
                type="password"
                placeholder="Password"
                {...register("password", {
                  required: "Password is required",
                })}
                className="w-full"
              />
              {errors.password && (
                <p className={errorClass}>{errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full">
              {isLogin ? "Login" : "Register"}
            </Button>
            {generalError && <p className={errorClass}>{generalError}</p>}
          </form>
          <p className="text-center text-sm mt-4">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-gray-600 hover:underline"
            >
              {isLogin ? "Register" : "Login"}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
