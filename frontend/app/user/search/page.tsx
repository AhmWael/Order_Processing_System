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

function SearchResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    category: "",
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
    if (!currentUser || (currentUser.role !== "Customer" && currentUser.role !== "Admin")) {
      router.push("/");
      return;
    }

    loadAllBooks();
  }, [router]);

  useEffect(() => {
    if (allBooks.length > 0) {
      filterBooks(query, allBooks, filters);
    }
  }, [query, allBooks, filters]);

  const loadAllBooks = async () => {
    try {
      const response = await booksApi.getAll();
      if (response.data) {
        // Remove duplicates by ISBN
        const uniqueBooks = Array.from(
          new Map(response.data.map(book => [book.isbn, book])).values()
        );
        setAllBooks(uniqueBooks);
        filterBooks(query, uniqueBooks, filters);
      }
    } catch (error) {
      console.error("Failed to load books:", error);
      setLoading(false);
    }
  };

  const filterBooks = (searchQuery: string, booksToFilter: Book[], currentFilters: FilterState) => {
    setLoading(true);
    const searchTerm = searchQuery.toLowerCase().trim();
    
    let filtered = booksToFilter;

    // Apply search query filter
    if (searchTerm) {
      filtered = filtered.filter(book => {
        const titleMatch = book.title.toLowerCase().includes(searchTerm);
        const authorMatch = book.authors?.some(author => 
          author.toLowerCase().includes(searchTerm)
        );
        const categoryMatch = book.category.toLowerCase().includes(searchTerm);
        const isbnMatch = book.isbn.toLowerCase().includes(searchTerm);
        
        return titleMatch || authorMatch || categoryMatch || isbnMatch;
      });
    }

    // Apply category filter
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
        <h1 className="text-3xl font-bold mb-4">Search Results</h1>
        <div className="max-w-2xl">
          <SearchBar />
        </div>
      </div>

      <SearchFilters onFilterChange={handleFilterChange} allBooks={allBooks} />

      {(query || filters.category || filters.author || filters.minPrice || filters.maxPrice) && (
        <div className="mb-6">
          <p className="text-muted-foreground">
            {loading ? "Searching..." : `Found ${books.length} result${books.length !== 1 ? "s" : ""}`}
            {query && ` for "${query}"`}
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
