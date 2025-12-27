"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { isAuthenticated, getCurrentUser } from "@/lib/auth";
import { Book, Plus, Package, BarChart3, ArrowRight, Settings } from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

    setUser(currentUser);
    setLoading(false);
  }, [router]);

  if (loading || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome, {user.username}. Manage books, orders, and view reports.
        </p>
      </div>

      {/* Admin Pages Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              Manage Books
            </CardTitle>
            <CardDescription>
              View, edit, and update stock for all books in the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/books">
              <Button className="w-full" variant="default">
                Manage Books
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Book
            </CardTitle>
            <CardDescription>
              Add a new book to the catalog with ISBN, title, authors, and details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/books/new">
              <Button className="w-full" variant="outline">
                Add Book
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Publisher Orders
            </CardTitle>
            <CardDescription>
              View and confirm automatically created replenishment orders.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/publisher-orders">
              <Button className="w-full" variant="outline">
                View Orders
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Reports
            </CardTitle>
            <CardDescription>
              View sales reports, top customers, and best-selling books.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/reports">
              <Button className="w-full" variant="outline">
                View Reports
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
