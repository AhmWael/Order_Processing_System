"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const fieldClassName =
    "bg-indigo-300 ring-indigo-600 ring-1 text-indigo-950 text-center rounded-xl";

  const buttonClassName =
    "text-violet-400 rounded-xl bg-indigo-800 hover:bg-indigo-900 transition px-5 py-4 text-center";
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();
  async function handleSubmit() {
    setError("");
    if (!username || !password || !firstName || !lastName || !email || !address) {
      setError("Please enter all required fields");
      return;
    }
    if (password !== rePassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username,
          firstName: firstName,
          lastName: lastName,
          email: email,
          phone: phone || null,
          address: address || null,
          password: password,
        }),
      });

      if (!res.ok) {
        let errorMessage = "Registration failed";
        try {
          const errorData = await res.json();
          // Handle ASP.NET Core validation errors
          if (errorData.errors) {
            const errors = Object.values(errorData.errors).flat();
            errorMessage = errors.join(", ");
          } else {
            errorMessage = errorData.message || errorData.title || errorMessage;
          }
        } catch (parseError) {
          errorMessage = res.statusText || `Server error (${res.status})`;
        }
        setError(errorMessage);
        return;
      }

      const data = await res.json();
      if (data.accessToken) {
        localStorage.setItem("token", data.accessToken);
        localStorage.setItem("user", JSON.stringify(data));
        router.push("/user/home");
      }
    } catch (err) {
      setError("An error occurred during registration. Please try again.");
      console.error(err);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/user/home");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-tr from-gray-900">
      <Card className="bg-black w-full max-w-md ">
        <CardHeader>
          <CardTitle className="text-gray-500">Create an account</CardTitle>
        </CardHeader>
        <CardContent>
          <form>
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
              <div className="flex flex-row gap-8">
                <div className="grid gap-2">
                  <Label htmlFor="Firstname" className="text-gray-500">
                    First Name
                  </Label>
                  <Input
                    id="Firstname"
                    className="text-gray-400"
                    type="text"
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="Lastname" className="text-gray-500">
                    Last Name
                  </Label>
                  <Input
                    id="Lastname"
                    className="text-gray-400"
                    type="text"
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="flex flex-row gap-8">
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label className="text-gray-500" htmlFor="password">
                      Password
                    </Label>
                  </div>
                  <Input
                    className="text-gray-400"
                    id="password"
                    type="password"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label className="text-gray-500" htmlFor="re-password">
                      Re-enter Password
                    </Label>
                  </div>
                  <Input
                    className="text-gray-400"
                    id="re-password"
                    type="password"
                    onChange={(e) => setRePassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="Email" className="text-gray-500">
                  Email
                </Label>
                <Input
                  className="text-gray-400"
                  placeholder="x@example.com"
                  id="Email"
                  type="Email"
                  pattern = "[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="Address" className="text-gray-500">
                  Address
                </Label>
                <Input
                  className="text-gray-400"
                  id="Address"
                  type="text"
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="Phone" className="text-gray-500">
                  Phone
                </Label>
                <Input
                  className="text-gray-400"
                  id="Phone"
                  type="text"
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>              
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          {error && (
            <Alert variant="destructive" className="w-full">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button onClick={handleSubmit} className="w-full">
            Register
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
