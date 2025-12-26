"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getCurrentUser, hasRole } from "@/lib/auth";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: "Customer" | "Admin";
  redirectTo?: string;
}

export default function AuthGuard({
  children,
  requiredRole,
  redirectTo = "/",
}: AuthGuardProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push(redirectTo);
      return;
    }

    const user = getCurrentUser();
    if (!user) {
      router.push(redirectTo);
      return;
    }

    if (requiredRole && !hasRole(requiredRole)) {
      // Redirect based on user role
      if (user.role === "Admin") {
        router.push("/admin/home");
      } else {
        router.push("/user/home");
      }
      return;
    }

    setIsAuthorized(true);
    setLoading(false);
  }, [router, requiredRole, redirectTo]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}

