"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { isAuthenticated, getCurrentUser } from "@/lib/auth";
import { replenishmentOrdersApi, ReplenishmentOrder, booksApi, Book } from "@/lib/api";
import { ArrowLeft, Package, CheckCircle2, Loader2, AlertCircle, Clock } from "lucide-react";

interface OrderWithDetails extends ReplenishmentOrder {
  bookDetails?: Book;
}

export default function PublisherOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
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

    loadOrders();
  }, [router]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await replenishmentOrdersApi.getAll();
      if (response.data) {
        const ordersWithDetails: OrderWithDetails[] = await Promise.all(
          response.data.map(async (order) => {
            const orderWithDetails: OrderWithDetails = { ...order };
            try {
              const bookResponse = await booksApi.getByIsbn(order.isbn);
              if (bookResponse.data) {
                orderWithDetails.bookDetails = bookResponse.data;
              }
            } catch (error) {
              console.error(`Failed to load book details for ISBN ${order.isbn}:`, error);
            }
            return orderWithDetails;
          })
        );
        setOrders(ordersWithDetails);
      } else if (response.error) {
        setError("Failed to load orders: " + response.error);
      }
    } catch (error) {
      console.error("Failed to load orders:", error);
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (orderId: string) => {
    setConfirmingOrderId(orderId);
    setError("");
    setSuccess("");

    try {
      const response = await replenishmentOrdersApi.confirm(orderId);

      if (response.error) {
        setError(response.error);
      } else {
        setSuccess("Order confirmed successfully!");
        await loadOrders();
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
      month: "long",
      day: "numeric",
    });
  };

  const pendingOrders = orders.filter((order) => order.status === "Pending");
  const confirmedOrders = orders.filter((order) => order.status === "Confirmed");

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading orders...</p>
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
        <h1 className="text-3xl font-bold mb-2">Publisher Orders</h1>
        <p className="text-muted-foreground">
          View and confirm replenishment orders created automatically when stock falls below threshold
        </p>
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

      {/* Pending Orders */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Orders ({pendingOrders.length})
          </h2>
        </div>

        {pendingOrders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No pending orders</h3>
              <p className="text-muted-foreground">
                All replenishment orders have been confirmed
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingOrders.map((order) => (
              <Card key={order.orderId} className="border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Order ID</p>
                          <p className="font-mono font-medium">{order.orderId.slice(0, 8)}...</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">ISBN</p>
                          <p className="font-medium">{order.isbn}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Quantity</p>
                          <p className="font-medium text-lg">{order.quantity}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Order Date</p>
                          <p className="font-medium">{formatDate(order.orderDate)}</p>
                        </div>
                      </div>
                      {order.bookDetails && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
                          <div>
                            <p className="text-sm text-muted-foreground">Book Title</p>
                            <p className="font-medium">{order.bookDetails.title}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Current Stock</p>
                            <p className={`font-medium ${order.bookDetails.stock < order.bookDetails.threshold ? 'text-red-600' : ''}`}>
                              {order.bookDetails.stock}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Threshold</p>
                            <p className="font-medium">{order.bookDetails.threshold}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Category</p>
                            <p className="font-medium">{order.bookDetails.category}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={() => handleConfirm(order.orderId)}
                      disabled={confirmingOrderId === order.orderId}
                      className="ml-4"
                    >
                      {confirmingOrderId === order.orderId ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Confirming...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Confirm Order
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Confirmed Orders */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          Confirmed Orders ({confirmedOrders.length})
        </h2>

        {confirmedOrders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No confirmed orders</h3>
              <p className="text-muted-foreground">
                Confirmed orders will appear here
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {confirmedOrders.map((order) => (
              <Card key={order.orderId} className="bg-green-50/50 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Order ID</p>
                          <p className="font-mono font-medium">{order.orderId.slice(0, 8)}...</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">ISBN</p>
                          <p className="font-medium">{order.isbn}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Quantity</p>
                          <p className="font-medium text-lg">{order.quantity}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Order Date</p>
                          <p className="font-medium">{formatDate(order.orderDate)}</p>
                        </div>
                      </div>
                      {order.bookDetails && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
                          <div>
                            <p className="text-sm text-muted-foreground">Book Title</p>
                            <p className="font-medium">{order.bookDetails.title}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Current Stock</p>
                            <p className="font-medium">{order.bookDetails.stock}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Threshold</p>
                            <p className="font-medium">{order.bookDetails.threshold}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Category</p>
                            <p className="font-medium">{order.bookDetails.category}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-medium">Confirmed</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

