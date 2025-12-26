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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { isAuthenticated, getCurrentUser } from "@/lib/auth";

export default function HomePage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  useEffect(() => {
    // Check if user is authenticated and redirect based on role
    if (isAuthenticated()) {
      const user = getCurrentUser();
      if (user) {
        if (user.role === "Customer") {
          router.push("/user/home");
        } else if (user.role === "Admin") {
          router.push("/admin/home");
        }
      }
    }
  }, [router]);
  

  async function handleSubmit() {
    setError("");
    if (!username || !password) {
      setError("Please enter username and password");
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Login: username, Password: password }),
      });

      if (!res.ok) {
        let errorMessage = "Invalid username or password";
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorData.title || errorMessage;
        } catch (parseError) {
          // If response is not JSON, use status text
          errorMessage = res.statusText || `Server error (${res.status})`;
        }
        setError(errorMessage);
        return;
      }

      const data = await res.json();
      if (!data.accessToken) {
        setError("Invalid response from server. Missing access token.");
        return;
      }

      localStorage.setItem("token", data.accessToken);
      router.push("/user/home");
    } catch (err: any) {
      console.error("Login error:", err);

      // Handle network errors
      if (err instanceof TypeError && err.message.includes("fetch")) {
        setError(
          "Cannot connect to server. Please check if the backend is running on http://localhost:8080"
        );
      } else if (err instanceof SyntaxError) {
        setError("Invalid response from server. Please try again.");
      } else {
        setError(err.message || "Something went wrong. Please try again.");
      }
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
                value={username}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                required
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex-col gap-2">
          {error && (
            <Alert className="p-2 bg-gray-700" variant="destructive">
              <AlertCircle />
              <AlertTitle>{error}</AlertTitle>
            </Alert>
          )}
          <Button
            type="button"
            onClick={handleSubmit}
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
