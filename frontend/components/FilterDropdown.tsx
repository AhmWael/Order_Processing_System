"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { booksApi, Book } from "@/lib/api";

interface FilterDropdownProps {
  type: "genre" | "author";
  label: string;
}

export default function FilterDropdown({ type, label }: FilterDropdownProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadItems = async () => {
    try {
      const response = await booksApi.getAll();
      if (response.data) {
        // Remove duplicates by ISBN
        const uniqueBooks = Array.from(
          new Map(response.data.map(book => [book.isbn, book])).values()
        );

        if (type === "genre") {
          const categories = Array.from(
            new Set(uniqueBooks.map(book => book.category.toLowerCase()))
          ).sort();
          setItems(categories);
        } else if (type === "author") {
          const authors = Array.from(
            new Set(
              uniqueBooks.flatMap(book => book.authors || [])
            )
          ).sort();
          setItems(authors);
        }
      }
    } catch (error) {
      console.error("Failed to load filter items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (item: string) => {
    setIsOpen(false);
    if (type === "genre") {
      router.push(`/user/books?category=${encodeURIComponent(item)}`);
    } else {
      router.push(`/user/search?q=${encodeURIComponent(item)}`);
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary"
      >
        {label}
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <div
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          className="absolute top-full left-0 mt-2 w-48 bg-background border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading...
            </div>
          ) : items.length > 0 ? (
            <div className="py-1">
              {items.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleItemClick(item)}
                  className="w-full text-left px-4 py-2 hover:bg-muted transition-colors capitalize"
                >
                  {item}
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No {type}s available
            </div>
          )}
        </div>
      )}
    </div>
  );
}

