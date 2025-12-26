"use client";
import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "./ui/button";
import { getCurrentUser, isAuthenticated } from "@/lib/auth";
import { Book, ShoppingCart, User, Home, LogOut, Settings, FileText, BarChart3, Package, Plus } from "lucide-react";
import SearchBar from "./SearchBar";
import FilterDropdown from "./FilterDropdown";
import { cartApi } from "@/lib/api";

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated()) {
      setUser(getCurrentUser());
      if (getCurrentUser()?.role === "Customer") {
        loadCartCount();
      }
    }
  }, [pathname]);

  // Refresh cart count periodically and on pathname change
  useEffect(() => {
    if (user && user.role === "Customer") {
      loadCartCount();
      // Refresh cart count every 3 seconds
      const interval = setInterval(loadCartCount, 3000);
      
      // Refresh when page becomes visible (user switches back to tab)
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          loadCartCount();
        }
      };
      document.addEventListener("visibilitychange", handleVisibilityChange);
      
      return () => {
        clearInterval(interval);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      };
    }
  }, [user, pathname]);

  const loadCartCount = async () => {
    try {
      const response = await cartApi.getCart();
      if (response.data) {
        const totalItems = response.data.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(totalItems);
      }
    } catch (error) {
      // Silently fail if cart can't be loaded
      console.error("Failed to load cart count:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/");
  };

  // Don't show header on auth pages
  if (pathname === "/" || pathname === "/signup") {
    return null;
  }

  if (!mounted) {
    return null;
  }

  const isUserRoute = pathname?.startsWith("/user");
  const isAdminRoute = pathname?.startsWith("/admin");

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex flex-col gap-4 px-4 py-3">
        {/* Top Row: Logo, Nav, User */}
        <div className="flex h-12 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href={isUserRoute ? "/user/home" : isAdminRoute ? "/admin/home" : "/"} className="flex items-center gap-2">
              <Book className="h-6 w-6" />
              <span className="text-xl font-bold">BookStore</span>
            </Link>

            {user && (
              <nav className="hidden md:flex items-center gap-4">
                {user.role === "Customer" && (
                  <>
                    <Link
                      href="/user/home"
                      className={`text-sm font-medium transition-colors hover:text-primary ${
                        pathname === "/user/home" ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        Home
                      </div>
                    </Link>
                    <Link
                      href="/user/books"
                      className={`text-sm font-medium transition-colors hover:text-primary ${
                        pathname === "/user/books" ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Book className="h-4 w-4" />
                        Books
                      </div>
                    </Link>
                    <FilterDropdown type="genre" label="Genres" />
                    <FilterDropdown type="author" label="Authors" />
                    <Link
                      href="/user/cart"
                      className={`text-sm font-medium transition-colors hover:text-primary relative ${
                        pathname === "/user/cart" ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <ShoppingCart className="h-4 w-4" />
                          {cartCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                              {cartCount > 99 ? "99+" : cartCount}
                            </span>
                          )}
                        </div>
                        Cart
                      </div>
                    </Link>
                    <Link
                      href="/user/orders"
                      className={`text-sm font-medium transition-colors hover:text-primary ${
                        pathname === "/user/orders" ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        My Orders
                      </div>
                    </Link>
                    <Link
                      href="/user/profile"
                      className={`text-sm font-medium transition-colors hover:text-primary ${
                        pathname === "/user/profile" ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Profile
                      </div>
                    </Link>
                  </>
                )}
                {user.role === "Admin" && (
                  <>
                    <Link
                      href="/admin/home"
                      className={`text-sm font-medium transition-colors hover:text-primary ${
                        pathname === "/admin/home" ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        Dashboard
                      </div>
                    </Link>
                    <Link
                      href="/admin/books"
                      className={`text-sm font-medium transition-colors hover:text-primary ${
                        pathname?.startsWith("/admin/books") ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Book className="h-4 w-4" />
                        Manage Books
                      </div>
                    </Link>
                    <Link
                      href="/admin/publisher-orders"
                      className={`text-sm font-medium transition-colors hover:text-primary ${
                        pathname === "/admin/publisher-orders" ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Publisher Orders
                      </div>
                    </Link>
                    <Link
                      href="/admin/reports"
                      className={`text-sm font-medium transition-colors hover:text-primary ${
                        pathname === "/admin/reports" ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Reports
                      </div>
                    </Link>
                  </>
                )}
              </nav>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>{user.username}</span>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    {user.role}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={() => router.push("/")}>
                Login
              </Button>
            )}
          </div>
        </div>

        {/* Search Bar Row - Show for all authenticated users (shared page) */}
        {user && (
          <div className="flex justify-center">
            <SearchBar className="w-full max-w-2xl" />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
