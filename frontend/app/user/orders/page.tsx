"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { isAuthenticated, getCurrentUser } from "@/lib/auth";
import { ordersApi, CustomerOrder, CustomerOrderItem } from "@/lib/api";
import { Package, ArrowLeft, Calendar, DollarSign, Book as BookIcon } from "lucide-react";
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
        // Load items for each order
        const ordersWithItems = await Promise.all(
          response.data.map(async (order) => {
            const itemsResponse = await ordersApi.getItems(order.orderId);
            return {
              ...order,
              items: itemsResponse.data || [],
            };
          })
        );
        setOrders(ordersWithItems);
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
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
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
              You haven't placed any orders. Start shopping to see your orders here.
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
            <Card key={order.orderId} className="hover:shadow-md transition-shadow">
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
                        <DollarSign className="h-4 w-4" />
                        ${order.totalPrice.toFixed(2)}
                      </span>
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => toggleOrder(order.orderId)}
                  >
                    {expandedOrder === order.orderId ? "Hide Details" : "View Details"}
                  </Button>
                </div>
              </CardHeader>
              {expandedOrder === order.orderId && (
                <CardContent>
                  <div className="space-y-3 pt-4 border-t">
                    <h3 className="font-semibold mb-3">Order Items:</h3>
                    {order.items.map((item) => (
                      <div
                        key={item.isbn}
                        className="flex gap-4 p-3 bg-muted/50 rounded-lg"
                      >
                        <Link href={`/user/books/${item.isbn}`} className="flex-shrink-0">
                          <div className="w-16 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg overflow-hidden relative">
                            <img
                              src={getBookCoverUrl(item.isbn, 'S')}
                              alt={item.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const placeholder = target.nextElementSibling as HTMLElement;
                                if (placeholder) placeholder.style.display = 'flex';
                              }}
                            />
                            <div className="hidden w-full h-full items-center justify-center">
                              <BookIcon className="h-6 w-6 text-primary/40" />
                            </div>
                          </div>
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link href={`/user/books/${item.isbn}`}>
                            <h4 className="font-semibold hover:text-primary transition-colors line-clamp-2">
                              {item.title}
                            </h4>
                          </Link>
                          <p className="text-sm text-muted-foreground mb-1">ISBN: {item.isbn}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">
                              Quantity: {item.quantity}
                            </span>
                            <span className="font-semibold text-primary">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
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

