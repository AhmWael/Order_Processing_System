"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { isAuthenticated, getCurrentUser } from "@/lib/auth";
import { ordersApi, CustomerOrder, CustomerOrderItem } from "@/lib/api";
import {
  Package,
  ArrowLeft,
  Calendar,
  DollarSign,
  Book as BookIcon,
  ChevronDown,
  ChevronUp,
  Receipt,
} from "lucide-react";
import { getBookCoverUrl } from "@/lib/bookCovers";

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/");
      return;
    }

    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== "Customer") {
      router.push("/");
      return;
    }

    loadOrders();
  }, [router]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersApi.getAll();
      if (response.data) {
        // Items are already included in the response from the backend
        setOrders(response.data);
      } else if (response.error) {
        console.error("Failed to load orders:", response.error);
      }
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  };

  const toggleOrder = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/user/home">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">My Orders</h1>
        <p className="text-muted-foreground">
          View your order history and track your purchases
        </p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-6">
              You haven't placed any orders. Start shopping to see your orders
              here.
            </p>
            <Link href="/user/books">
              <Button size="lg">
                <BookIcon className="mr-2 h-4 w-4" />
                Browse Books
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card
              key={order.orderId}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Order #{order.orderId.slice(0, 8).toUpperCase()}
                    </CardTitle>
                    <CardDescription className="mt-2 flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(order.orderDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />$
                        {order.totalPrice.toFixed(2)}
                      </span>
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => toggleOrder(order.orderId)}
                    className="flex items-center gap-2"
                  >
                    {expandedOrder === order.orderId ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        Hide Details
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        View Details
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              {expandedOrder === order.orderId && (
                <CardContent>
                  <div className="pt-4 border-t space-y-6">
                    {/* Order Information Section */}
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <Receipt className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-lg">
                          Order Information
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Order ID:
                          </span>
                          <span className="ml-2 font-mono font-medium">
                            {order.orderId}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Order Date & Time:
                          </span>
                          <span className="ml-2 font-medium">
                            {formatDateTime(order.orderDate)}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Total Items:
                          </span>
                          <span className="ml-2 font-medium">
                            {order.items?.length || 0}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Total Quantity:
                          </span>
                          <span className="ml-2 font-medium">
                            {order.items?.reduce(
                              (sum, item) => sum + item.quantity,
                              0
                            ) || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Order Items Section */}
                    <div>
                      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <BookIcon className="h-5 w-5" />
                        Order Items ({order.items?.length || 0})
                      </h3>
                      <div className="space-y-3">
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item, index) => (
                            <div
                              key={`${item.isbn}-${index}`}
                              className="flex gap-4 p-4 bg-muted/50 rounded-lg border hover:bg-muted/70 transition-colors"
                            >
                              <Link
                                href={`/user/books/${item.isbn}`}
                                className="flex-shrink-0"
                              >
                                <div className="w-20 h-28 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg overflow-hidden relative shadow-sm">
                                  <img
                                    src={getBookCoverUrl(item.isbn, "M")}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target =
                                        e.target as HTMLImageElement;
                                      target.style.display = "none";
                                      const placeholder =
                                        target.nextElementSibling as HTMLElement;
                                      if (placeholder)
                                        placeholder.style.display = "flex";
                                    }}
                                  />
                                  <div className="hidden w-full h-full items-center justify-center bg-muted">
                                    <BookIcon className="h-8 w-8 text-primary/40" />
                                  </div>
                                </div>
                              </Link>
                              <div className="flex-1 min-w-0">
                                <Link href={`/user/books/${item.isbn}`}>
                                  <h4 className="font-semibold hover:text-primary transition-colors line-clamp-2 mb-2 text-lg">
                                    {item.title}
                                  </h4>
                                </Link>
                                <p className="text-sm text-muted-foreground mb-3">
                                  <span className="font-medium">ISBN:</span>{" "}
                                  {item.isbn}
                                </p>
                                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t">
                                  <div className="flex items-center gap-4 text-sm">
                                    <span className="text-muted-foreground">
                                      <span className="font-medium">
                                        Quantity:
                                      </span>{" "}
                                      {item.quantity}
                                    </span>
                                    <span className="text-muted-foreground">
                                      <span className="font-medium">
                                        Unit Price:
                                      </span>{" "}
                                      ${item.price.toFixed(2)}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-sm text-muted-foreground">
                                      Item Total:
                                    </span>
                                    <span className="ml-2 font-bold text-lg text-primary">
                                      ${(item.price * item.quantity).toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            No items found in this order.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Summary Section */}
                    <div className="bg-primary/5 border-2 border-primary/20 p-4 rounded-lg">
                      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Order Summary
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Subtotal (
                            {order.items?.reduce(
                              (sum, item) => sum + item.quantity,
                              0
                            ) || 0}{" "}
                            items):
                          </span>
                          <span className="font-medium">
                            $
                            {order.items
                              ?.reduce(
                                (sum, item) => sum + item.price * item.quantity,
                                0
                              )
                              .toFixed(2) || "0.00"}
                          </span>
                        </div>
                        <div className="border-t pt-2 mt-2 flex justify-between items-center">
                          <span className="font-semibold text-lg">
                            Total Amount:
                          </span>
                          <span className="font-bold text-xl text-primary">
                            ${order.totalPrice.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
