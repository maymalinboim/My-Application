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

interface AuthForm {
  username: string;
  email?: string;
  password: string;
}

export default function AuthPage2() {
  const [isLogin, setIsLogin] = useState(true);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthForm>();

  const onSubmit = (data: AuthForm) => {
    console.log(isLogin ? "Logging in..." : "Registering...", data);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
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
                {...register("username", { required: "Email is required" })}
                className="w-full"
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
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
                  minLength: {
                    value: 6,
                    message: "Must be at least 6 characters",
                  },
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
