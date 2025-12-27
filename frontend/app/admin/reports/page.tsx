"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { isAuthenticated, getCurrentUser } from "@/lib/auth";
import { reportsApi, TotalSales, TopCustomer, TopSellingBook } from "@/lib/api";
import { ArrowLeft, BarChart3, DollarSign, Users, Book as BookIcon, Calendar, Loader2, AlertCircle, TrendingUp } from "lucide-react";

export default function ReportsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Sales Reports
  const [previousMonthSales, setPreviousMonthSales] = useState<TotalSales | null>(null);
  const [dateSales, setDateSales] = useState<TotalSales | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [loadingDateSales, setLoadingDateSales] = useState(false);
  
  // Top Customers
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  
  // Top Books
  const [topBooks, setTopBooks] = useState<TopSellingBook[]>([]);

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

    loadAllReports();
  }, [router]);

  const loadAllReports = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadPreviousMonthSales(),
        loadTopCustomers(),
        loadTopBooks(),
      ]);
    } catch (error) {
      console.error("Failed to load reports:", error);
      setError("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const loadPreviousMonthSales = async () => {
    try {
      const response = await reportsApi.getSalesPreviousMonth();
      if (response.data) {
        setPreviousMonthSales(response.data);
      } else if (response.error) {
        console.error("Failed to load previous month sales:", response.error);
      }
    } catch (error) {
      console.error("Failed to load previous month sales:", error);
    }
  };

  const loadDateSales = async () => {
    if (!selectedDate) return;

    setLoadingDateSales(true);
    try {
      const response = await reportsApi.getSalesByDate(selectedDate);
      if (response.data) {
        setDateSales(response.data);
      } else if (response.error) {
        setError("Failed to load sales for selected date: " + response.error);
      }
    } catch (error) {
      console.error("Failed to load date sales:", error);
      setError("Failed to load sales for selected date");
    } finally {
      setLoadingDateSales(false);
    }
  };

  const loadTopCustomers = async () => {
    try {
      const response = await reportsApi.getTop5Customers();
      if (response.data) {
        setTopCustomers(response.data);
      } else if (response.error) {
        console.error("Failed to load top customers:", response.error);
      }
    } catch (error) {
      console.error("Failed to load top customers:", error);
    }
  };

  const loadTopBooks = async () => {
    try {
      const response = await reportsApi.getTop10Books();
      if (response.data) {
        setTopBooks(response.data);
      } else if (response.error) {
        console.error("Failed to load top books:", response.error);
      }
    } catch (error) {
      console.error("Failed to load top books:", error);
    }
  };

  const getPreviousMonthName = () => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading reports...</p>
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
        <h1 className="text-3xl font-bold mb-2">Reports</h1>
        <p className="text-muted-foreground">
          View sales statistics, top customers, and best-selling books
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Sales Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Previous Month Sales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Sales - {getPreviousMonthName()}
            </CardTitle>
            <CardDescription>Total sales for the previous month</CardDescription>
          </CardHeader>
          <CardContent>
            {previousMonthSales ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Sales</p>
                  <p className="text-3xl font-bold text-primary">
                    ${previousMonthSales.totalSales.toFixed(2)}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                    <p className="text-xl font-semibold">{previousMonthSales.totalOrders}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Books Sold</p>
                    <p className="text-xl font-semibold">{previousMonthSales.totalBooksSold}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No sales data available</p>
            )}
          </CardContent>
        </Card>

        {/* Sales by Date */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Sales by Date
            </CardTitle>
            <CardDescription>View sales for a specific date</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="date">Select Date</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                  <Button onClick={loadDateSales} disabled={!selectedDate || loadingDateSales}>
                    {loadingDateSales ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "View"
                    )}
                  </Button>
                </div>
              </div>
              {dateSales && (
                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Sales</p>
                    <p className="text-3xl font-bold text-primary">
                      ${dateSales.totalSales.toFixed(2)}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Orders</p>
                      <p className="text-xl font-semibold">{dateSales.totalOrders}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Books Sold</p>
                      <p className="text-xl font-semibold">{dateSales.totalBooksSold}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Customers */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Top 5 Customers (Last 3 Months)
          </CardTitle>
          <CardDescription>Customers with the highest purchase amounts</CardDescription>
        </CardHeader>
        <CardContent>
          {topCustomers.length === 0 ? (
            <p className="text-muted-foreground">No customer data available</p>
          ) : (
            <div className="space-y-4">
              {topCustomers.map((customer, index) => (
                <div
                  key={customer.userId}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">
                        {customer.firstName} {customer.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {customer.email} • {customer.username}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {customer.totalOrders} order(s)
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">
                      ${customer.totalPurchaseAmount.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">Total Spent</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Selling Books */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookIcon className="h-5 w-5" />
            Top 10 Best-Selling Books (Last 3 Months)
          </CardTitle>
          <CardDescription>Books ranked by total copies sold</CardDescription>
        </CardHeader>
        <CardContent>
          {topBooks.length === 0 ? (
            <p className="text-muted-foreground">No book sales data available</p>
          ) : (
            <div className="space-y-4">
              {topBooks.map((book, index) => (
                <div
                  key={book.isbn}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{book.title}</p>
                      <p className="text-sm text-muted-foreground">ISBN: {book.isbn}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Ordered {book.timesOrdered} time(s)
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">
                      {book.totalCopiesSold}
                    </p>
                    <p className="text-xs text-muted-foreground">Copies Sold</p>
                    <p className="text-sm font-medium mt-1">
                      ${book.totalRevenue.toFixed(2)} revenue
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

