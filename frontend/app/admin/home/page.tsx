"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { isAuthenticated, getCurrentUser } from "@/lib/auth";
import { 
  booksApi, 
  replenishmentOrdersApi, 
  reportsApi, 
  Book, 
  ReplenishmentOrder,
  TotalSales 
} from "@/lib/api";
import { 
  Book as BookIcon, 
  Plus, 
  Package, 
  BarChart3, 
  ArrowRight, 
  Settings,
  AlertTriangle,
  Users,
  DollarSign,
  Loader2,
  CheckCircle2,
  UserPlus
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Dashboard data
  const [totalBooks, setTotalBooks] = useState(0);
  const [booksBelowThreshold, setBooksBelowThreshold] = useState<Book[]>([]);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [todaySales, setTodaySales] = useState<TotalSales | null>(null);
  const [pendingOrders, setPendingOrders] = useState<ReplenishmentOrder[]>([]);
  const [confirmingOrderId, setConfirmingOrderId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
    loadDashboardData();
  }, [router]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      // Load all data in parallel
      const [booksResponse, ordersResponse, salesResponse] = await Promise.all([
        booksApi.getAll(),
        replenishmentOrdersApi.getAll(),
        reportsApi.getSalesByDate(new Date().toISOString().split('T')[0])
      ]);

      if (booksResponse.data) {
        const allBooks = booksResponse.data;
        // Remove duplicates by ISBN
        const uniqueBooks = Array.from(
          new Map(allBooks.map(book => [book.isbn, book])).values()
        );
        setTotalBooks(uniqueBooks.length);
        
        // Filter books below threshold
        const belowThreshold = uniqueBooks.filter(book => book.stock < book.threshold);
        setBooksBelowThreshold(belowThreshold);
      }

      if (ordersResponse.data) {
        const pending = ordersResponse.data.filter(order => order.status === "Pending");
        setPendingOrdersCount(pending.length);
        setPendingOrders(pending.slice(0, 5)); // Show top 5 on dashboard
      }

      if (salesResponse.data) {
        setTodaySales(salesResponse.data);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOrder = async (orderId: string) => {
    setConfirmingOrderId(orderId);
    setError("");
    setSuccess("");

    try {
      const response = await replenishmentOrdersApi.confirm(orderId);
      if (response.error) {
        setError(response.error);
      } else {
        setSuccess("Order confirmed successfully!");
        await loadDashboardData(); // Reload data
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error: any) {
      setError("Failed to confirm order: " + (error.message || "Unknown error"));
    } finally {
      setConfirmingOrderId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome, {user.username}. Manage books, orders, and view reports.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200 mb-4">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Books</CardTitle>
            <BookIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBooks}</div>
            <p className="text-xs text-muted-foreground">Books in system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${
              booksBelowThreshold.length === 0 
                ? "text-green-600" 
                : booksBelowThreshold.length <= 10 
                  ? "text-yellow-600" 
                  : "text-red-600"
            }`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              booksBelowThreshold.length === 0 
                ? "text-green-600" 
                : booksBelowThreshold.length <= 10 
                  ? "text-yellow-600" 
                  : "text-red-600"
            }`}>{booksBelowThreshold.length}</div>
            <p className="text-xs text-muted-foreground">Books below threshold</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrdersCount}</div>
            <p className="text-xs text-muted-foreground">Publisher orders pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${todaySales?.totalSales.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">
              {todaySales?.totalOrders || 0} orders • {todaySales?.totalBooksSold || 0} books
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookIcon className="h-5 w-5" />
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
              <UserPlus className="h-5 w-5" />
              Register Admin
            </CardTitle>
            <CardDescription>
              Create a new administrator account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/register-admin">
              <Button className="w-full" variant="outline">
                Register Admin
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              View Customers
            </CardTitle>
            <CardDescription>
              View all customers registered in the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/customers">
              <Button className="w-full" variant="outline">
                View Customers
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Low Stock Alerts
            </CardTitle>
            <CardDescription>
              Books below their threshold level
            </CardDescription>
          </CardHeader>
          <CardContent>
            {booksBelowThreshold.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No books below threshold. All stock levels are healthy.
              </p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {booksBelowThreshold.map((book) => (
                  <div
                    key={book.isbn}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{book.title}</div>
                      <div className="text-sm text-muted-foreground">
                        ISBN: {book.isbn}
                      </div>
                      <div className="text-sm font-semibold text-red-600">
                        Stock: {book.stock} / Threshold: {book.threshold}
                      </div>
                    </div>
                    <Link href={`/admin/books`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
            {booksBelowThreshold.length > 0 && (
              <div className="mt-4">
                <Link href="/admin/books">
                  <Button variant="outline" className="w-full">
                    Manage All Books
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Publisher Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Pending Publisher Orders
            </CardTitle>
            <CardDescription>
              Recent replenishment orders awaiting confirmation
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingOrders.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No pending orders. All replenishment orders have been confirmed.
              </p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {pendingOrders.map((order) => (
                  <div
                    key={order.orderId}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-mono text-muted-foreground">
                        Order: {order.orderId.slice(0, 8)}...
                      </div>
                      <div className="font-medium">ISBN: {order.isbn}</div>
                      <div className="text-sm text-muted-foreground">
                        Quantity: {order.quantity} • {formatDate(order.orderDate)}
                      </div>
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleConfirmOrder(order.orderId)}
                      disabled={confirmingOrderId === order.orderId}
                    >
                      {confirmingOrderId === order.orderId ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Confirming...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Confirm
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {pendingOrdersCount > 5 && (
              <div className="mt-4">
                <Link href="/admin/publisher-orders">
                  <Button variant="outline" className="w-full">
                    View All Orders ({pendingOrdersCount})
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reports Card */}
      <Card>
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
  );
}
