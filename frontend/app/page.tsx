"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export default function HomePage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = () => {
      // TODO: Replace with actual auth check (cookies, tokens, etc.)
      const token = localStorage.getItem("token");
      const userRole = localStorage.getItem("userRole");

      if (token) {
        // Redirect based on user role
        if (userRole === "admin") {
          router.push("/admin/home");
        } else {
          router.push("/home");
        }
      }
    };
    checkAuth();
  }, [router]);

  function handleSubmit() {
    if (!username || !password) {
      alert("Please enter username and password");
      return;
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-tr from-gray-900">
      <Card className="bg-black w-full max-w-sm ">
        <CardHeader>
          <CardTitle className="text-gray-500">Login to your account</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="Username" className="text-gray-500">
                Username
              </Label>
              <Input
                id="Username"
                className="text-gray-400"
                type="text"
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center">
                <Label className="text-gray-500" htmlFor="password">
                  Password
                </Label>
                <a
                  href="#"
                  className="text-gray-500 ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a>
              </div>

              <Input
                className="text-gray-400"
                id="password"
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex-col gap-2">
          <Button
            onClick={handleSubmit}
            type="submit"
            className="cursor-pointer w-full"
          >
            Login
          </Button>
          <a
            href="/signup"
            className="text-gray-500 text-left text-sm underline-offset-4 hover:underline"
          >
            Sign Up
          </a>
        </CardFooter>
      </Card>
    </div>
  );
}
