"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Filter, ChevronDown } from "lucide-react";
import { booksApi, Book } from "@/lib/api";

interface SearchFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  allBooks: Book[];
}

export interface FilterState {
  category: string;
  author: string;
  minPrice: string;
  maxPrice: string;
}

export default function SearchFilters({ onFilterChange, allBooks }: SearchFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [authors, setAuthors] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    category: "",
    author: "",
    minPrice: "",
    maxPrice: "",
  });

  useEffect(() => {
    if (allBooks.length > 0) {
      const uniqueBooks = Array.from(
        new Map(allBooks.map(book => [book.isbn, book])).values()
      );

      const cats = Array.from(
        new Set(uniqueBooks.map(book => book.category.toLowerCase()))
      ).sort();
      setCategories(cats);

      const auths = Array.from(
        new Set(uniqueBooks.flatMap(book => book.authors || []))
      ).sort();
      setAuthors(auths);
    }
  }, [allBooks]);

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      author: "",
      minPrice: "",
      maxPrice: "",
    });
  };

  const hasActiveFilters = filters.category || filters.author || filters.minPrice || filters.maxPrice;

  return (
    <div className="w-full lg:w-auto">
      <div className="flex items-center gap-2 mb-2">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {[filters.category, filters.author, filters.minPrice, filters.maxPrice].filter(Boolean).length}
            </span>
          )}
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isOpen && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category Filter */}
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={filters.category}
                  onChange={(e) => handleFilterChange("category", e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Author Filter */}
              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <select
                  id="author"
                  value={filters.author}
                  onChange={(e) => handleFilterChange("author", e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">All Authors</option>
                  {authors.map((author) => (
                    <option key={author} value={author}>
                      {author}
                    </option>
                  ))}
                </select>
              </div>

              {/* Min Price */}
              <div className="space-y-2">
                <Label htmlFor="minPrice">Min Price ($)</Label>
                <Input
                  id="minPrice"
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                />
              </div>

              {/* Max Price */}
              <div className="space-y-2">
                <Label htmlFor="maxPrice">Max Price ($)</Label>
                <Input
                  id="maxPrice"
                  type="number"
                  placeholder="999.99"
                  min="0"
                  step="0.01"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

