"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isAuthenticated, getCurrentUser } from "@/lib/auth";
import { booksApi, BookCreateDto, authorsApi, publishersApi, Author, Publisher, AuthorCreateDto, PublisherCreateDto } from "@/lib/api";
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2, Plus, X } from "lucide-react";

const BOOK_CATEGORIES = ['Science', 'Art', 'Religion', 'History', 'Geography'];

export default function AddBookPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [authors, setAuthors] = useState<Author[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [formData, setFormData] = useState<BookCreateDto>({
    isbn: "",
    title: "",
    pubId: "",
    pubYear: undefined,
    price: 0,
    category: "",
    stock: 0,
    threshold: 0,
    authorIds: [],
  });
  const [selectedAuthorIds, setSelectedAuthorIds] = useState<string[]>([]);
  
  // Create new author/publisher states
  const [showAddAuthor, setShowAddAuthor] = useState(false);
  const [newAuthorName, setNewAuthorName] = useState("");
  const [creatingAuthor, setCreatingAuthor] = useState(false);
  
  const [showAddPublisher, setShowAddPublisher] = useState(false);
  const [newPublisherName, setNewPublisherName] = useState("");
  const [newPublisherAddress, setNewPublisherAddress] = useState("");
  const [creatingPublisher, setCreatingPublisher] = useState(false);
  
  // Local state for publication year input (allows typing while validating)
  const [pubYearInput, setPubYearInput] = useState<string>("");

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

    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [authorsResponse, publishersResponse] = await Promise.all([
        authorsApi.getAll(),
        publishersApi.getAll(),
      ]);

      if (authorsResponse.data) {
        setAuthors(authorsResponse.data);
      }
      if (publishersResponse.data) {
        setPublishers(publishersResponse.data);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      setError("Failed to load authors and publishers");
    } finally {
      setLoading(false);
    }
  };

  // Initialize pubYearInput from formData
  useEffect(() => {
    if (formData.pubYear !== undefined) {
      setPubYearInput(formData.pubYear.toString());
    } else {
      setPubYearInput("");
    }
  }, []); // Only run once on mount

  const handleCreateAuthor = async () => {
    if (!newAuthorName.trim()) {
      setError("Please enter an author name");
      return;
    }

    setCreatingAuthor(true);
    setError("");
    try {
      const authorData: AuthorCreateDto = {
        authorName: newAuthorName.trim(),
      };
      const response = await authorsApi.create(authorData);
      if (response.error) {
        setError(response.error);
      } else {
        setNewAuthorName("");
        setShowAddAuthor(false);
        await loadData(); // Reload authors
      }
    } catch (error: any) {
      setError("Failed to create author: " + (error.message || "Unknown error"));
    } finally {
      setCreatingAuthor(false);
    }
  };

  const handleCreatePublisher = async () => {
    if (!newPublisherName.trim()) {
      setError("Please enter a publisher name");
      return;
    }

    setCreatingPublisher(true);
    setError("");
    try {
      const publisherData: PublisherCreateDto = {
        publisherName: newPublisherName.trim(),
        address: newPublisherAddress.trim() || undefined,
        phones: [],
      };
      const response = await publishersApi.create(publisherData);
      if (response.error) {
        setError(response.error);
      } else {
        setNewPublisherName("");
        setNewPublisherAddress("");
        setShowAddPublisher(false);
        await loadData(); // Reload publishers
      }
    } catch (error: any) {
      setError("Failed to create publisher: " + (error.message || "Unknown error"));
    } finally {
      setCreatingPublisher(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!formData.isbn || !formData.title || !formData.category || !formData.pubId) {
      setError("Please fill in all required fields");
      return;
    }

    if (formData.price <= 0) {
      setError("Price must be greater than 0");
      return;
    }

    if (selectedAuthorIds.length === 0) {
      setError("Please select at least one author");
      return;
    }

    setSaving(true);
    try {
      const bookData: BookCreateDto = {
        ...formData,
        authorIds: selectedAuthorIds,
      };

      const response = await booksApi.create(bookData);

      if (response.error) {
        setError(response.error);
      } else {
        setSuccess("Book created successfully! Redirecting...");
        setTimeout(() => {
          router.push("/admin/books");
        }, 1500);
      }
    } catch (error: any) {
      setError("Failed to create book: " + (error.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  const toggleAuthor = (authorId: string) => {
    setSelectedAuthorIds((prev) =>
      prev.includes(authorId)
        ? prev.filter((id) => id !== authorId)
        : [...prev, authorId]
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/admin/books">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Manage Books
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">Add New Book</h1>
        <p className="text-muted-foreground">
          Add a new book to the catalog
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Book Information</CardTitle>
          <CardDescription>Enter the details for the new book</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            {/* ISBN */}
            <div className="space-y-2">
              <Label htmlFor="isbn">ISBN *</Label>
              <Input
                id="isbn"
                type="text"
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                disabled={saving}
                required
                placeholder="978-0-123456-78-9"
              />
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                disabled={saving}
                required
              />
            </div>

            {/* Publisher */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="publisher">Publisher *</Label>
                {!showAddPublisher && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowAddPublisher(true);
                      setShowAddAuthor(false);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Publisher
                  </Button>
                )}
              </div>
              
              {showAddPublisher ? (
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Add New Publisher</CardTitle>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setShowAddPublisher(false);
                          setNewPublisherName("");
                          setNewPublisherAddress("");
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="newPublisherName">Publisher Name *</Label>
                      <Input
                        id="newPublisherName"
                        value={newPublisherName}
                        onChange={(e) => setNewPublisherName(e.target.value)}
                        disabled={creatingPublisher}
                        placeholder="Enter publisher name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="newPublisherAddress">Address (Optional)</Label>
                      <Input
                        id="newPublisherAddress"
                        value={newPublisherAddress}
                        onChange={(e) => setNewPublisherAddress(e.target.value)}
                        disabled={creatingPublisher}
                        placeholder="Enter publisher address"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={handleCreatePublisher}
                        disabled={creatingPublisher || !newPublisherName.trim()}
                      >
                        {creatingPublisher ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Publisher
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowAddPublisher(false);
                          setNewPublisherName("");
                          setNewPublisherAddress("");
                        }}
                        disabled={creatingPublisher}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <select
                  id="publisher"
                  value={formData.pubId}
                  onChange={(e) => setFormData({ ...formData, pubId: e.target.value })}
                  disabled={saving}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option key="select-publisher" value="">Select a publisher</option>
                  {publishers.map((publisher) => (
                    <option key={publisher.pubId} value={publisher.pubId}>
                      {publisher.publisherName}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Authors */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Authors * (Select at least one)</Label>
                {!showAddAuthor && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowAddAuthor(true);
                      setShowAddPublisher(false);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Author
                  </Button>
                )}
              </div>
              
              {showAddAuthor ? (
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Add New Author</CardTitle>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setShowAddAuthor(false);
                          setNewAuthorName("");
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="newAuthorName">Author Name *</Label>
                      <Input
                        id="newAuthorName"
                        value={newAuthorName}
                        onChange={(e) => setNewAuthorName(e.target.value)}
                        disabled={creatingAuthor}
                        placeholder="Enter author name"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={handleCreateAuthor}
                        disabled={creatingAuthor || !newAuthorName.trim()}
                      >
                        {creatingAuthor ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Author
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowAddAuthor(false);
                          setNewAuthorName("");
                        }}
                        disabled={creatingAuthor}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
                  {authors.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No authors available. Click "Add Author" to create one.</p>
                  ) : (
                    <div className="space-y-2">
                      {authors.map((author) => (
                        <label
                          key={author.authorId}
                          className="flex items-center space-x-2 cursor-pointer hover:bg-muted/50 p-2 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={selectedAuthorIds.includes(author.authorId)}
                            onChange={() => toggleAuthor(author.authorId)}
                            disabled={saving}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm">{author.authorName}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {selectedAuthorIds.length > 0 && !showAddAuthor && (
                <p className="text-xs text-muted-foreground">
                  {selectedAuthorIds.length} author(s) selected
                </p>
              )}
            </div>

            {/* Price, Category, Year */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  disabled={saving}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  disabled={saving}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option key="select-category" value="">Select a category</option>
                  {BOOK_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pubYear">Publication Year</Label>
                <Input
                  id="pubYear"
                  type="text"
                  value={pubYearInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Only allow digits, max 4 characters
                    if (value === "" || /^\d+$/.test(value)) {
                      setPubYearInput(value);
                      if (value === "") {
                        setFormData({ ...formData, pubYear: undefined });
                      } else if (value.length === 4) {
                        const year = parseInt(value);
                        if (year >= 1000 && year <= 9999) {
                          setFormData({ ...formData, pubYear: year });
                        }
                      }
                    }
                  }}
                  onBlur={(e) => {
                    // Validate on blur
                    const value = e.target.value;
                    if (value === "") {
                      setFormData({ ...formData, pubYear: undefined });
                    } else {
                      const year = parseInt(value);
                      if (isNaN(year) || year < 1000 || year > 9999) {
                        setPubYearInput("");
                        setFormData({ ...formData, pubYear: undefined });
                      } else {
                        setPubYearInput(year.toString());
                        setFormData({ ...formData, pubYear: year });
                      }
                    }
                  }}
                  disabled={saving}
                  placeholder="e.g., 2024"
                  maxLength={4}
                />
                <p className="text-xs text-muted-foreground">
                  Enter a year (e.g., 2024)
                </p>
              </div>
            </div>

            {/* Stock and Threshold */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock">Stock *</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  disabled={saving}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="threshold">Threshold *</Label>
                <Input
                  id="threshold"
                  type="number"
                  min="0"
                  value={formData.threshold}
                  onChange={(e) => setFormData({ ...formData, threshold: parseInt(e.target.value) || 0 })}
                  disabled={saving}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Replenishment order is created when stock falls below this value
                </p>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={saving} className="flex-1">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Book
                  </>
                )}
              </Button>
              <Link href="/admin/books" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
