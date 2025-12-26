"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { isAuthenticated, getCurrentUser } from "@/lib/auth";
import { booksApi, Book } from "@/lib/api";
import { Book as BookIcon } from "lucide-react";
import BookCard from "@/components/BookCard";
import SearchBar from "@/components/SearchBar";

function BooksPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get("category");

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [allBooks, setAllBooks] = useState<Book[]>([]);

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

    loadBooks();
  }, [router, category]);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const response = await booksApi.getAll(category || undefined);
      if (response.data) {
        // Remove duplicates by ISBN
        const uniqueBooks = Array.from(
          new Map(response.data.map(book => [book.isbn, book])).values()
        );
        setBooks(uniqueBooks);
        setAllBooks(uniqueBooks);
      }
    } catch (error) {
      console.error("Failed to load books:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    // Cart count will be updated by the BookCard component
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">
          {category ? `${category.charAt(0).toUpperCase() + category.slice(1)} Books` : "All Books"}
        </h1>
        {category && (
          <Button
            variant="ghost"
            onClick={() => router.push("/user/books")}
            className="mb-4"
          >
            View All Books
          </Button>
        )}
        <div className="max-w-2xl">
          <SearchBar />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="w-full h-48 bg-muted rounded-lg mb-4"></div>
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : books.length > 0 ? (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {books.length} book{books.length !== 1 ? "s" : ""}
            {category && ` in ${category}`}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <BookCard key={book.isbn} book={book} onAddToCart={handleAddToCart} />
            ))}
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <BookIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Books Found</h2>
            <p className="text-muted-foreground mb-4">
              {category
                ? `No books found in the ${category} category.`
                : "No books available at the moment."}
            </p>
            {category && (
              <Button variant="outline" onClick={() => router.push("/user/books")}>
                View All Books
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function BooksPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <BooksPageContent />
    </Suspense>
  );
}

