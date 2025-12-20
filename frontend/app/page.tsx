"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();

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

  const buttonClassName =
    "text-violet-400 rounded-xl bg-indigo-800 hover:bg-indigo-900 transition px-5 py-4 text-center";

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-tr from-blue-200 to-indigo-500">
      <div className="bg-linear-to-br from-gray-700 to-black rounded-xl shadow-2xl p-8 ring-2 ring-indigo-700">
        <h1 className="text-center font-bold text-indigo-500 text-3xl">
          Welcome to our Bookstore!
        </h1>
        <p className="text-center text-indigo-400 mb-7">
          Sign-in or create an account to continue
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/login" className={buttonClassName}>
            login
          </Link>
          <Link href="/signup" className={buttonClassName}>
            signup
          </Link>
        </div>
      </div>
    </div>
  );
}
