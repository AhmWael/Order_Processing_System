"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { isAuthenticated, getCurrentUser } from "@/lib/auth";
import { booksApi, Book, BookUpdateDto, authorsApi, Author } from "@/lib/api";
import { ArrowLeft, Book as BookIcon, Edit, Trash2, Save, X, Loader2, AlertCircle, CheckCircle2, Plus, Search } from "lucide-react";
import { getBookCoverUrl } from "@/lib/bookCovers";

export default function ManageBooksPage() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingIsbn, setEditingIsbn] = useState<string | null>(null);
  const [deletingIsbn, setDeletingIsbn] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editForm, setEditForm] = useState<BookUpdateDto>({
    title: "",
    pubId: "",
    pubYear: undefined,
    price: 0,
    category: "",
    stock: 0,
    threshold: 0,
    authorIds: [],
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/");
      return;
    }

    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== "Admin") {
      router.push("/");
      return;
    }

    loadBooks();
  }, [router]);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const [booksResponse, authorsResponse] = await Promise.all([
        booksApi.getAll(),
        authorsApi.getAll(),
      ]);
      
      if (booksResponse.data) {
        setBooks(booksResponse.data);
      } else if (booksResponse.error) {
        setError("Failed to load books: " + booksResponse.error);
      }
      
      if (authorsResponse.data) {
        setAuthors(authorsResponse.data);
      }
    } catch (error) {
      console.error("Failed to load books:", error);
      setError("Failed to load books");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (book: Book) => {
    // Map author names to author IDs
    const authorIds = book.authors
      .map((authorName) => {
        const author = authors.find((a) => a.authorName === authorName);
        return author?.authorId;
      })
      .filter((id): id is string => id !== undefined);

    // If authors aren't loaded yet or can't map, show error
    if (authors.length === 0) {
      setError("Authors are still loading. Please wait a moment and try again.");
      return;
    }

    if (authorIds.length === 0 && book.authors.length > 0) {
      setError("Could not find author IDs. Some authors may not exist in the system. Please refresh the page.");
      return;
    }
    
    setEditingIsbn(book.isbn);
    setEditForm({
      title: book.title,
      pubId: book.pubId,
      pubYear: book.pubYear,
      price: book.price,
      category: book.category,
      stock: book.stock,
      threshold: book.threshold,
      authorIds: authorIds,
    });
    setError("");
    setSuccess("");
  };

  const handleCancelEdit = () => {
    setEditingIsbn(null);
    setEditForm({
      title: "",
      pubId: "",
      pubYear: undefined,
      price: 0,
      category: "",
      stock: 0,
      threshold: 0,
      authorIds: [],
    });
  };

  const handleSaveEdit = async (isbn: string) => {
    setError("");
    setSuccess("");

    if (!editForm.title || !editForm.category || !editForm.pubId || editForm.price <= 0) {
      setError("Please fill in all required fields");
      return;
    }

    if (!editForm.authorIds || editForm.authorIds.length === 0) {
      setError("Book must have at least one author");
      return;
    }

    try {
      const response = await booksApi.update(isbn, editForm);
      if (response.error) {
        setError(response.error);
      } else {
        setSuccess("Book updated successfully!");
        setEditingIsbn(null);
        await loadBooks();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error: any) {
      setError("Failed to update book: " + (error.message || "Unknown error"));
    }
  };

  const handleDelete = async (isbn: string) => {
    if (!confirm(`Are you sure you want to delete the book "${isbn}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingIsbn(isbn);
    setError("");
    setSuccess("");

    try {
      const response = await booksApi.delete(isbn);
      if (response.error) {
        setError(response.error);
      } else {
        setSuccess("Book deleted successfully!");
        await loadBooks();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error: any) {
      setError("Failed to delete book: " + (error.message || "Unknown error"));
    } finally {
      setDeletingIsbn(null);
    }
  };

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading books...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/admin/home">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Manage Books</h1>
            <p className="text-muted-foreground">
              View, edit, and delete books in the system
            </p>
          </div>
          <Link href="/admin/books/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Book
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200 mb-4">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by title, ISBN, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Books List */}
      {filteredBooks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No books found</h2>
            <p className="text-muted-foreground mb-6">
              {searchTerm ? "Try a different search term" : "Get started by adding a new book"}
            </p>
            <Link href="/admin/books/new">
              <Button size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Add New Book
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredBooks.map((book) => (
            <Card key={book.isbn} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                {editingIsbn === book.isbn ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Title *</label>
                        <Input
                          value={editForm.title}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Category *</label>
                        <Input
                          value={editForm.category}
                          onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Price *</label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editForm.price}
                          onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Publication Year</label>
                        <Input
                          type="number"
                          value={editForm.pubYear || ""}
                          onChange={(e) => setEditForm({ ...editForm, pubYear: e.target.value ? parseInt(e.target.value) : undefined })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Stock *</label>
                        <Input
                          type="number"
                          min="0"
                          value={editForm.stock}
                          onChange={(e) => setEditForm({ ...editForm, stock: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Threshold *</label>
                        <Input
                          type="number"
                          min="0"
                          value={editForm.threshold}
                          onChange={(e) => setEditForm({ ...editForm, threshold: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button onClick={() => handleSaveEdit(book.isbn)} size="sm">
                        <Save className="mr-2 h-4 w-4" />
                        Save
                      </Button>
                      <Button onClick={handleCancelEdit} variant="outline" size="sm">
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-6">
                    <div className="w-24 h-32 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg overflow-hidden relative flex-shrink-0">
                      <img
                        src={getBookCoverUrl(book.isbn, 'M')}
                        alt={book.title}
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
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-1">{book.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">ISBN: {book.isbn}</p>
                          <p className="text-sm mb-2">
                            <span className="font-medium">Authors:</span> {book.authors.join(", ") || "N/A"}
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4">
                            <div>
                              <span className="text-muted-foreground">Category:</span>
                              <p className="font-medium">{book.category}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Price:</span>
                              <p className="font-medium">${book.price.toFixed(2)}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Stock:</span>
                              <p className={`font-medium ${book.stock < book.threshold ? 'text-destructive' : ''}`}>
                                {book.stock} / {book.threshold} threshold
                              </p>
                            </div>
                            {book.pubYear && (
                              <div>
                                <span className="text-muted-foreground">Year:</span>
                                <p className="font-medium">{book.pubYear}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(book)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(book.isbn)}
                            disabled={deletingIsbn === book.isbn}
                            className="text-destructive hover:text-destructive"
                          >
                            {deletingIsbn === book.isbn ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

