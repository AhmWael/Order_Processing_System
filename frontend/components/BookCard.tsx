"use client";
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book, ShoppingCart, Check } from "lucide-react";
import { Book as BookType } from "@/lib/api";
import { cartApi } from "@/lib/api";
import { getBookCoverUrl } from "@/lib/bookCovers";
import Link from "next/link";

interface BookCardProps {
  book: BookType;
  onAddToCart?: () => void;
}

export default function BookCard({ book, onAddToCart }: BookCardProps) {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (adding || added) return;

    setAdding(true);
    try {
      const response = await cartApi.addItem({
        isbn: book.isbn,
        quantity: 1,
      });

      if (response.error) {
        alert(response.error);
      } else {
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
        if (onAddToCart) {
          onAddToCart();
        }
      }
    } catch (error) {
      console.error("Failed to add to cart:", error);
      alert("Failed to add item to cart");
    } finally {
      setAdding(false);
    }
  };

  const isInStock = book.stock > 0;
  const authorsText = book.authors?.join(", ") || "Unknown Author";

  const coverUrl = getBookCoverUrl(book.isbn, 'M');
  const [imageError, setImageError] = useState(false);

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
      <Link href={`/user/books/${book.isbn}`} className="flex-1 flex flex-col">
        <CardHeader className="pb-3">
          <div className="w-full aspect-[2/3] max-h-44 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center mb-4 overflow-hidden relative">
            {!imageError && coverUrl ? (
              <img
                src={coverUrl}
                alt={book.title}
                className="w-full h-full object-contain"
                onError={() => setImageError(true)}
              />
            ) : (
              <Book className="h-16 w-16 text-primary/40" />
            )}
          </div>
          <CardTitle className="line-clamp-2 text-lg leading-tight">
            {book.title}
          </CardTitle>
          <CardDescription className="line-clamp-1 text-sm">
            {authorsText}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-primary">
                ${book.price.toFixed(2)}
              </span>
              {!isInStock && (
                <span className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded">
                  Out of Stock
                </span>
              )}
              {isInStock && book.stock < 10 && (
                <span className="text-xs bg-yellow-500/10 text-yellow-600 px-2 py-1 rounded">
                  Only {book.stock} left
                </span>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="capitalize">{book.category}</span>
              {book.pubYear && ` • ${book.pubYear}`}
            </div>
          </div>
        </CardContent>
      </Link>
      <CardFooter className="pt-0">
        <Button
          className="w-full"
          onClick={handleAddToCart}
          disabled={!isInStock || adding || added}
          variant={added ? "default" : "default"}
        >
          {adding ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Adding...
            </>
          ) : added ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Added!
            </>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

