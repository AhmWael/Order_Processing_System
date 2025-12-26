"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

const Header = () => {
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/");
    };

    return (
        <button onClick={handleLogout} className="text-white bg-red-500 hover:bg-red-700 px-4 py-2 rounded">
            logout
        </button>
    )
};

export default Header;
