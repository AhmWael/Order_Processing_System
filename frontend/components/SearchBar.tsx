"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { booksApi, Book } from "@/lib/api";

interface SearchBarProps {
  className?: string;
}

export default function SearchBar({ className }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Book[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const allBooksRef = useRef<Book[]>([]);

  // Load all books on mount for client-side search
  useEffect(() => {
    const loadAllBooks = async () => {
      try {
        const response = await booksApi.getAll();
        if (response.data) {
          // Remove duplicates by ISBN
          const uniqueBooks = Array.from(
            new Map(response.data.map(book => [book.isbn, book])).values()
          );
          allBooksRef.current = uniqueBooks;
        }
      } catch (error) {
        console.error("Failed to load books for search:", error);
      }
    };
    loadAllBooks();
  }, []);

  // Filter books based on query with debouncing for auto-search
  useEffect(() => {
    if (query.trim().length === 0) {
      setSuggestions([]);
      setShowSuggestions(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Debounce search for better performance (300ms delay)
    const timeoutId = setTimeout(() => {
      const searchTerm = query.toLowerCase().trim();
      
      // Client-side search - auto-searches as you type
      const filtered = allBooksRef.current
        .filter(book => {
          const titleMatch = book.title.toLowerCase().includes(searchTerm);
          const authorMatch = book.authors?.some(author => 
            author.toLowerCase().includes(searchTerm)
          );
          const categoryMatch = book.category.toLowerCase().includes(searchTerm);
          const isbnMatch = book.isbn.toLowerCase().includes(searchTerm);
          
          return titleMatch || authorMatch || categoryMatch || isbnMatch;
        })
        .slice(0, 5); // Top 5 suggestions

      setSuggestions(filtered);
      // Always show suggestions dropdown if there are results or if query exists
      setShowSuggestions(true);
      setLoading(false);
    }, 300); // 300ms debounce delay

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSuggestionClick = (book: Book) => {
    setQuery("");
    setShowSuggestions(false);
    router.push(`/user/books/${book.isbn}`);
  };

  const handleViewAll = () => {
    if (query.trim()) {
      setShowSuggestions(false);
      router.push(`/user/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.trim()) {
      handleViewAll();
    }
  };

  return (
    <div ref={searchRef} className={`relative w-full max-w-2xl ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search books by title, author, category, or ISBN..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            // Show suggestions immediately when typing
            if (e.target.value.trim().length > 0) {
              setShowSuggestions(true);
            }
          }}
          onFocus={() => {
            // Show suggestions when focused if there's a query
            if (query.trim().length > 0) {
              setShowSuggestions(true);
            }
          }}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setShowSuggestions(false);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showSuggestions && query.trim().length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-background border rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Searching...
            </div>
          ) : suggestions.length > 0 ? (
            <>
              <div className="py-1">
                {suggestions.map((book) => (
                  <button
                    key={book.isbn}
                    onClick={() => handleSuggestionClick(book)}
                    className="w-full text-left px-4 py-3 hover:bg-muted transition-colors border-b last:border-b-0"
                  >
                    <div className="font-medium">{book.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {book.authors?.join(", ") || "Unknown Author"}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {book.category} • ${book.price.toFixed(2)}
                    </div>
                  </button>
                ))}
              </div>
              <div className="border-t p-2">
                <Button
                  variant="ghost"
                  className="w-full justify-center"
                  onClick={handleViewAll}
                >
                  View all results for "{query}"
                </Button>
              </div>
            </>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No books found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

