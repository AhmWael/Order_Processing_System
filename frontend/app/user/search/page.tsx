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

function SearchResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

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

    loadAllBooks();
  }, [router]);

  useEffect(() => {
    if (allBooks.length > 0 && query) {
      filterBooks(query);
    }
  }, [query, allBooks]);

  const loadAllBooks = async () => {
    try {
      const response = await booksApi.getAll();
      if (response.data) {
        // Remove duplicates by ISBN
        const uniqueBooks = Array.from(
          new Map(response.data.map(book => [book.isbn, book])).values()
        );
        setAllBooks(uniqueBooks);
        if (query) {
          filterBooks(query, uniqueBooks);
        } else {
          setLoading(false);
        }
      }
    } catch (error) {
      console.error("Failed to load books:", error);
      setLoading(false);
    }
  };

  const filterBooks = (searchQuery: string, booksToFilter = allBooks) => {
    setLoading(true);
    const searchTerm = searchQuery.toLowerCase().trim();
    
    const filtered = booksToFilter.filter(book => {
      const titleMatch = book.title.toLowerCase().includes(searchTerm);
      const authorMatch = book.authors?.some(author => 
        author.toLowerCase().includes(searchTerm)
      );
      const categoryMatch = book.category.toLowerCase().includes(searchTerm);
      const isbnMatch = book.isbn.toLowerCase().includes(searchTerm);
      
      return titleMatch || authorMatch || categoryMatch || isbnMatch;
    });

    setBooks(filtered);
    setLoading(false);
  };

  const handleAddToCart = () => {
    // Cart count will be updated by the BookCard component
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Search Results</h1>
        <div className="max-w-2xl">
          <SearchBar />
        </div>
      </div>

      {query && (
        <div className="mb-6">
          <p className="text-muted-foreground">
            {loading ? "Searching..." : `Found ${books.length} result${books.length !== 1 ? "s" : ""} for "${query}"`}
          </p>
        </div>
      )}

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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((book) => (
            <BookCard key={book.isbn} book={book} onAddToCart={handleAddToCart} />
          ))}
        </div>
      ) : query ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Results Found</h2>
            <p className="text-muted-foreground mb-4">
              We couldn't find any books matching "{query}"
            </p>
            <Button variant="outline" onClick={() => router.push("/user/books")}>
              Browse All Books
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <BookIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Enter a search query to find books</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  );
}

