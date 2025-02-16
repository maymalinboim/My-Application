import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
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

  const onSubmit = (data: AuthForm) => {
    if (isLogin) {
      handleLogin(data.username, data.password);
    } else {
      handleRegister(data.username, data.email || "", data.password);
    }
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>{isLogin ? "Login" : "Register"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div>
              <Input
                type="username"
                placeholder="Username"
                {...register("username", { required: "Username is required" })}
                className="w-full"
              />
              {errors.username && <p>{errors.username.message}</p>}
            </div>
            {!isLogin && (
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  {...register("email", { required: "Email is required" })}
                  className="w-full"
                />
                {errors.email && <p>{errors.email.message}</p>}
              </div>
            )}
            <div>
              <Input
                type="password"
                placeholder="Password"
                {...register("password", {
                  required: "Password is required",
                })}
              />
              {errors.password && <p>{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full">
              {isLogin ? "Login" : "Register"}
            </Button>
          </form>
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Register" : "Login"}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
