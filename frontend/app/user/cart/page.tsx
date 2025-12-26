"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { isAuthenticated, getCurrentUser } from "@/lib/auth";
import { cartApi, CartItem } from "@/lib/api";
import { getBookCoverUrl } from "@/lib/bookCovers";
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, CreditCard, Book as BookIcon } from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

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

    loadCart();
  }, [router]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await cartApi.getCart();
      if (response.data) {
        setCartItems(response.data);
      } else if (response.error) {
        console.error("Failed to load cart:", response.error);
      }
    } catch (error) {
      console.error("Failed to load cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (isbn: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(isbn);
      return;
    }

    setUpdating(isbn);
    try {
      // Remove the item first, then add with new quantity
      await cartApi.removeItem(isbn);
      const response = await cartApi.addItem({
        isbn: isbn,
        quantity: newQuantity,
      });

      if (response.error) {
        alert(response.error);
      } else {
        await loadCart();
      }
    } catch (error) {
      console.error("Failed to update quantity:", error);
      alert("Failed to update quantity");
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (isbn: string) => {
    setRemoving(isbn);
    try {
      const response = await cartApi.removeItem(isbn);
      if (response.error) {
        alert(response.error);
      } else {
        await loadCart();
      }
    } catch (error) {
      console.error("Failed to remove item:", error);
      alert("Failed to remove item");
    } finally {
      setRemoving(null);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.total, 0);
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading cart...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/user/home">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">Shopping Cart</h1>
        <p className="text-muted-foreground">
          {cartItems.length > 0
            ? `${totalItems} item${totalItems !== 1 ? "s" : ""} in your cart`
            : "Your cart is empty"}
        </p>
      </div>

      {cartItems.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Start adding books to your cart to continue shopping.
            </p>
            <Link href="/user/books">
              <Button size="lg">
                <BookIcon className="mr-2 h-4 w-4" />
                Browse Books
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.isbn} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Book Cover */}
                    <Link href={`/user/books/${item.isbn}`} className="flex-shrink-0">
                      <div className="w-24 h-32 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg overflow-hidden relative">
                        <img
                          src={getBookCoverUrl(item.isbn, 'S')}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const placeholder = target.nextElementSibling as HTMLElement;
                            if (placeholder) placeholder.style.display = 'flex';
                          }}
                        />
                        <div className="hidden w-full h-full items-center justify-center">
                          <BookIcon className="h-8 w-8 text-primary/40" />
                        </div>
                      </div>
                    </Link>

                    {/* Book Details */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/user/books/${item.isbn}`}>
                        <h3 className="font-semibold text-lg mb-1 hover:text-primary transition-colors line-clamp-2">
                          {item.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground mb-3">ISBN: {item.isbn}</p>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg font-bold text-primary">
                            ${item.price.toFixed(2)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            ${item.total.toFixed(2)} total
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 border rounded-lg">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.isbn, item.quantity - 1)}
                              disabled={updating === item.isbn || removing === item.isbn}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-12 text-center font-medium">
                              {updating === item.isbn ? "..." : item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.isbn, item.quantity + 1)}
                              disabled={updating === item.isbn || removing === item.isbn}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Remove Button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => removeItem(item.isbn)}
                            disabled={removing === item.isbn || updating === item.isbn}
                          >
                            {removing === item.isbn ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-destructive border-t-transparent" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Items ({totalItems})</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Link href="/user/checkout" className="block">
                  <Button className="w-full" size="lg">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Proceed to Checkout
                  </Button>
                </Link>

                <Link href="/user/books" className="block">
                  <Button variant="outline" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

