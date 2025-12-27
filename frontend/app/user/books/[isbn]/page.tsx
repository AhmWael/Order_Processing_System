"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { isAuthenticated, getCurrentUser } from "@/lib/auth";
import { booksApi, cartApi, Book } from "@/lib/api";
import { Book as BookIcon, ShoppingCart, Check, ArrowLeft } from "lucide-react";
import { getBookCoverUrl } from "@/lib/bookCovers";
import Link from "next/link";

export default function BookDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const isbn = params?.isbn as string;
  
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/");
      return;
    }

    const currentUser = getCurrentUser();
    if (!currentUser || (currentUser.role !== "Customer" && currentUser.role !== "Admin")) {
      router.push("/");
      return;
    }

    if (isbn) {
      loadBook();
    }
  }, [isbn, router]);

  const loadBook = async () => {
    try {
      const response = await booksApi.getByIsbn(isbn);
      if (response.data) {
        setBook(response.data);
      } else if (response.error) {
        console.error("Failed to load book:", response.error);
      }
    } catch (error) {
      console.error("Failed to load book:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!book || adding || added) return;

    setAdding(true);
    try {
      const response = await cartApi.addItem({
        isbn: book.isbn,
        quantity: quantity,
      });

      if (response.error) {
        alert(response.error);
      } else {
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
      }
    } catch (error) {
      console.error("Failed to add to cart:", error);
      alert("Failed to add item to cart");
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading book details...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <BookIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Book Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The book you're looking for doesn't exist.
            </p>
            <Link href="/user/books">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Books
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isInStock = book.stock > 0;
  const authorsText = book.authors?.join(", ") || "Unknown Author";

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/user/books">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Books
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Book Image/Placeholder */}
        <div>
          <Card>
            <CardContent className="p-8">
              <div className="w-full h-[500px] bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center overflow-hidden relative">
                {book && !imageError ? (
                  <img
                    src={getBookCoverUrl(book.isbn, 'L')}
                    alt={book.title}
                    className="w-full h-full object-contain"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <BookIcon className="h-32 w-32 text-primary/40" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Book Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
            <p className="text-lg text-muted-foreground mb-4">by {authorsText}</p>
            
            <div className="flex items-center gap-4 mb-6">
              <span className="text-4xl font-bold text-primary">
                ${book.price.toFixed(2)}
              </span>
              {!isInStock && (
                <span className="text-sm bg-destructive/10 text-destructive px-3 py-1 rounded">
                  Out of Stock
                </span>
              )}
              {isInStock && book.stock < 10 && (
                <span className="text-sm bg-yellow-500/10 text-yellow-600 px-3 py-1 rounded">
                  Only {book.stock} left in stock
                </span>
              )}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Book Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-sm font-medium text-muted-foreground">ISBN:</span>
                <p className="text-base">{book.isbn}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Category:</span>
                <p className="text-base capitalize">{book.category}</p>
              </div>
              {book.pubYear && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Publication Year:</span>
                  <p className="text-base">{book.pubYear}</p>
                </div>
              )}
              <div>
                <span className="text-sm font-medium text-muted-foreground">Stock:</span>
                <p className="text-base">{book.stock} available</p>
              </div>
            </CardContent>
          </Card>

          {isInStock && (
            <Card>
              <CardHeader>
                <CardTitle>Add to Cart</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Quantity</label>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      -
                    </Button>
                    <span className="text-lg font-medium w-12 text-center">{quantity}</span>
                    <Button
                      variant="outline"
                      onClick={() => setQuantity(Math.min(book.stock, quantity + 1))}
                      disabled={quantity >= book.stock}
                    >
                      +
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      (Max: {book.stock})
                    </span>
                  </div>
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={adding || added}
                >
                  {adding ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Adding...
                    </>
                  ) : added ? (
                    <>
                      <Check className="mr-2 h-5 w-5" />
                      Added to Cart!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Add to Cart
                    </>
                  )}
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  Total: ${(book.price * quantity).toFixed(2)}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

