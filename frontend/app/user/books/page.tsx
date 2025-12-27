"use client";
import React, { useEffect, useState, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { isAuthenticated, getCurrentUser } from "@/lib/auth";
import { booksApi, Book } from "@/lib/api";
import { Book as BookIcon } from "lucide-react";
import BookCard from "@/components/BookCard";
import SearchBar from "@/components/SearchBar";
import SearchFilters, { FilterState } from "@/components/SearchFilters";

function BooksPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const searchQuery = searchParams.get("q") || "";

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    category: category || "",
    author: "",
    minPrice: "",
    maxPrice: "",
  });

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

  useEffect(() => {
    // Update category filter when URL category changes
    if (category) {
      setFilters(prev => ({ ...prev, category: category.toLowerCase() }));
    } else {
      setFilters(prev => ({ ...prev, category: "" }));
    }
  }, [category]);

  useEffect(() => {
    if (allBooks.length > 0) {
      applyFilters(allBooks, filters, searchQuery);
    }
  }, [allBooks, filters, searchQuery]);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const response = await booksApi.getAll();
      if (response.data) {
        // Remove duplicates by ISBN
        const uniqueBooks = Array.from(
          new Map(response.data.map(book => [book.isbn, book])).values()
        );
        setAllBooks(uniqueBooks);
        applyFilters(uniqueBooks, filters, searchQuery);
      }
    } catch (error) {
      console.error("Failed to load books:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (booksToFilter: Book[], currentFilters: FilterState, searchTerm: string) => {
    setLoading(true);
    let filtered = booksToFilter;

    // Apply URL category filter (from query param)
    if (category) {
      filtered = filtered.filter(book => 
        book.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Apply search query filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(book => {
        const titleMatch = book.title.toLowerCase().includes(term);
        const authorMatch = book.authors?.some(author => 
          author.toLowerCase().includes(term)
        );
        const categoryMatch = book.category.toLowerCase().includes(term);
        const isbnMatch = book.isbn.toLowerCase().includes(term);
        
        return titleMatch || authorMatch || categoryMatch || isbnMatch;
      });
    }

    // Apply category filter from filters
    if (currentFilters.category) {
      filtered = filtered.filter(book => 
        book.category.toLowerCase() === currentFilters.category.toLowerCase()
      );
    }

    // Apply author filter
    if (currentFilters.author) {
      filtered = filtered.filter(book => 
        book.authors?.some(author => 
          author.toLowerCase() === currentFilters.author.toLowerCase()
        )
      );
    }

    // Apply price filters
    if (currentFilters.minPrice) {
      const minPrice = parseFloat(currentFilters.minPrice);
      if (!isNaN(minPrice)) {
        filtered = filtered.filter(book => book.price >= minPrice);
      }
    }

    if (currentFilters.maxPrice) {
      const maxPrice = parseFloat(currentFilters.maxPrice);
      if (!isNaN(maxPrice)) {
        filtered = filtered.filter(book => book.price <= maxPrice);
      }
    }

    setBooks(filtered);
    setLoading(false);
  };

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

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
        
        {/* Search Bar */}
        <div className="mb-4">
          <div className="max-w-2xl">
            <SearchBar />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <SearchFilters onFilterChange={handleFilterChange} allBooks={allBooks} />
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

