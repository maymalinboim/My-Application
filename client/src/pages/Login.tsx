import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import config from "@/config";
import axios from "axios";

interface AuthForm {
  username: string;
  email?: string;
  password: string;
}

const handleLogin = async (username: string, password: string) => {
  const res = await axios.post(`${config.SERVER_URL}/users/login`, {
    username,
    password,
  });
  return res.status === 201;
};

const handleRegister = async (
  username: string,
  email: string,
  password: string
) => {
  const res = await axios.post(`${config.SERVER_URL}/users/register`, {
    username,
    email,
    password,
  });
  return res.status === 201;
};

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthForm>();

  const onSubmit = async (data: AuthForm) => {
    if (isLogin) {
      const succeed = await handleLogin(data.username, data.password);
      console.log(succeed);
    } else {
      const created = await handleRegister(
        data.username,
        data.email || "",
        data.password
      );
      console.log(created);
    }
  };

  return (
    <div className="flex items-center justify-center bg-gray-100 p-4">
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
                <p className="text-red-500 text-sm">
                  {errors.username.message}
                </p>
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
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
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
                <p className="text-red-500 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full">
              {isLogin ? "Login" : "Register"}
            </Button>
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
