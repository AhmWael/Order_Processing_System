"use client";
import Link from "next/link";
import { useState } from "react";
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
  const response = fetch("local");
  function handleSubmit() {}
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
                  required
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button type="submit" className="w-full">
            Register
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
