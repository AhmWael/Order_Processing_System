"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { isAuthenticated, getCurrentUser } from "@/lib/auth";
import { cartApi, booksApi, Book } from "@/lib/api";
import { Book as BookIcon, ShoppingCart, Package, ArrowRight, User, Settings } from "lucide-react";
import BookCard from "@/components/BookCard";

export default function UserHomePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [booksLoading, setBooksLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/");
      return;
    }

    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== "Customer") {
      router.push("/");
      return;
    }

    setUser(currentUser);
    loadCartData();
    loadBooks();
  }, [router]);

  const loadCartData = async () => {
    try {
      const response = await cartApi.getCart();
      if (response.data) {
        const totalItems = response.data.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(totalItems);
      }
    } catch (error) {
      console.error("Failed to load cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadBooks = async () => {
    try {
      const response = await booksApi.getAll();
      if (response.data) {
        // Remove duplicates by ISBN and show first 12 unique books
        const uniqueBooks = Array.from(
          new Map(response.data.map(book => [book.isbn, book])).values()
        );
        setBooks(uniqueBooks.slice(0, 12));
      } else if (response.error) {
        console.error("Failed to load books:", response.error);
      }
    } catch (error) {
      console.error("Failed to load books:", error);
    } finally {
      setBooksLoading(false);
    }
  };

  const handleAddToCart = () => {
    // Refresh cart count when item is added
    loadCartData();
  };

  if (loading || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user.username}!
        </h1>
        <p className="text-muted-foreground">
          Discover your next favorite book from our collection.
        </p>
      </div>

      {/* Customer Pages Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShoppingCart className="h-5 w-5" />
              Shopping Cart
            </CardTitle>
            <CardDescription>
              {cartCount > 0
                ? `You have ${cartCount} item${cartCount > 1 ? "s" : ""} in your cart.`
                : "Your cart is empty. Start adding books!"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/user/cart">
              <Button className="w-full" variant={cartCount > 0 ? "default" : "outline"}>
                {cartCount > 0 ? "View Cart" : "Go to Cart"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="h-5 w-5" />
              My Orders
            </CardTitle>
            <CardDescription>
              View your order history and track your recent purchases.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/user/orders">
              <Button className="w-full" variant="outline">
                View Orders
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5" />
              Customer Profile
            </CardTitle>
            <CardDescription>
              Edit your personal information and change your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/user/profile">
              <Button className="w-full" variant="outline">
                Edit Profile
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Featured Books Section */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Featured Books</h2>
            <p className="text-muted-foreground">
              Discover our handpicked selection of books
            </p>
          </div>
          <Link href="/user/books">
            <Button variant="outline" className="flex items-center gap-2">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {booksLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="w-full h-48 bg-muted rounded-lg mb-4"></div>
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-6 bg-muted rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardContent>
                <CardFooter>
                  <div className="h-10 bg-muted rounded w-full"></div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : books.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <BookCard key={book.isbn} book={book} onAddToCart={handleAddToCart} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <BookIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No books available at the moment.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
