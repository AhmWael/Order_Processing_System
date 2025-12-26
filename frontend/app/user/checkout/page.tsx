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
import { cartApi, creditCardsApi, CreditCard, CartItem, CheckoutDto, CreditCardAddDto } from "@/lib/api";
import { getBookCoverUrl } from "@/lib/bookCovers";
import {
  ArrowLeft,
  CreditCard as CreditCardIcon,
  ShoppingCart,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Book as BookIcon,
  Plus,
  X,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [addingCard, setAddingCard] = useState(false);
  const [newCard, setNewCard] = useState({
    cardNumber: "",
    cardholderName: "",
    expirationDate: "",
  });

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

    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cartResponse, cardsResponse] = await Promise.all([
        cartApi.getCart(),
        creditCardsApi.getAll(),
      ]);

      if (cartResponse.data) {
        setCartItems(cartResponse.data);
        if (cartResponse.data.length === 0) {
          setError("Your cart is empty. Please add items before checkout.");
        }
      } else if (cartResponse.error) {
        setError("Failed to load cart: " + cartResponse.error);
      }

      if (cardsResponse.data) {
        setCreditCards(cardsResponse.data);
        if (cardsResponse.data.length > 0 && !selectedCardId) {
          // Select the first non-expired card, or first card if all are expired
          const nonExpiredCard = cardsResponse.data.find((card) => !card.isExpired);
          setSelectedCardId(nonExpiredCard?.cardId || cardsResponse.data[0].cardId);
        }
      } else if (cardsResponse.error) {
        setError("Failed to load credit cards: " + cardsResponse.error);
      }
    } catch (error) {
      console.error("Failed to load checkout data:", error);
      setError("Failed to load checkout data");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.total, 0);
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Basic validation (mockup, so simple checks)
    if (!newCard.cardNumber || !newCard.cardholderName || !newCard.expirationDate) {
      setError("Please fill in all fields");
      return;
    }

    // Validate expiration date format (MM/YY)
    const expDateRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!expDateRegex.test(newCard.expirationDate)) {
      setError("Expiration date must be in MM/YY format (e.g., 12/25)");
      return;
    }

    setAddingCard(true);
    try {
      const cardData: CreditCardAddDto = {
        cardNumber: newCard.cardNumber.replace(/\s/g, ""), // Remove spaces
        cardholderName: newCard.cardholderName,
        expirationDate: newCard.expirationDate,
      };

      const response = await creditCardsApi.addCard(cardData);

      if (response.error) {
        setError(response.error);
      } else {
        // Reset form
        setNewCard({
          cardNumber: "",
          cardholderName: "",
          expirationDate: "",
        });
        setShowAddCard(false);
        
        // Reload credit cards and select the new one
        const cardsResponse = await creditCardsApi.getAll();
        if (cardsResponse.data) {
          setCreditCards(cardsResponse.data);
          if (response.data?.cardId) {
            setSelectedCardId(response.data.cardId);
          } else if (cardsResponse.data.length > 0) {
            const nonExpiredCard = cardsResponse.data.find((card) => !card.isExpired);
            setSelectedCardId(nonExpiredCard?.cardId || cardsResponse.data[0].cardId);
          }
        }
      }
    } catch (error: any) {
      setError("Failed to add credit card: " + (error.message || "Unknown error"));
    } finally {
      setAddingCard(false);
    }
  };

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");
    // Add spaces every 4 digits
    const formatted = digits.match(/.{1,4}/g)?.join(" ") || digits;
    return formatted.slice(0, 19); // Max 16 digits + 3 spaces
  };

  const formatExpirationDate = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");
    // Add slash after 2 digits
    if (digits.length >= 2) {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
    }
    return digits;
  };

  const handleCheckout = async () => {
    if (!selectedCardId) {
      setError("Please select a credit card");
      return;
    }

    if (cartItems.length === 0) {
      setError("Your cart is empty");
      return;
    }

    setProcessing(true);
    setError("");

    try {
      const checkoutData: CheckoutDto = {
        cardId: selectedCardId,
      };

      const response = await cartApi.checkout(checkoutData);

      if (response.error) {
        setError(response.error);
      } else {
        setSuccess(true);
        // Redirect to orders page after 2 seconds
        setTimeout(() => {
          router.push("/user/orders");
        }, 2000);
      }
    } catch (error: any) {
      setError("Failed to process checkout: " + (error.message || "Unknown error"));
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading checkout...</p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Order Placed Successfully!</h2>
            <p className="text-muted-foreground mb-6">
              Your order has been confirmed. Redirecting to your orders...
            </p>
            <Link href="/user/orders">
              <Button size="lg">View My Orders</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/user/home">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Please add items to your cart before checkout.
            </p>
            <Link href="/user/books">
              <Button size="lg">
                <BookIcon className="mr-2 h-4 w-4" />
                Browse Books
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/user/cart">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cart
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">Checkout</h1>
        <p className="text-muted-foreground">Review your order and complete your purchase</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cart Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
              <CardDescription>{totalItems} item{totalItems !== 1 ? "s" : ""} in your order</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.isbn} className="flex gap-4 p-4 border rounded-lg">
                    <Link href={`/user/books/${item.isbn}`} className="flex-shrink-0">
                      <div className="w-20 h-28 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg overflow-hidden relative">
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
                        <h3 className="font-semibold text-lg mb-1 hover:text-primary transition-colors line-clamp-2">
                          {item.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground mb-2">ISBN: {item.isbn}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Quantity: {item.quantity}</span>
                        <span className="text-lg font-bold text-primary">
                          ${item.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Payment Method</CardTitle>
                  <CardDescription>Select a credit card for payment</CardDescription>
                </div>
                {!showAddCard && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddCard(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Card
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {/* Add Credit Card Form */}
              {showAddCard && (
                <Card className="mb-4 border-primary/20 bg-primary/5">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Add New Credit Card</CardTitle>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setShowAddCard(false);
                          setNewCard({ cardNumber: "", cardholderName: "", expirationDate: "" });
                          setError("");
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddCard} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          value={newCard.cardNumber}
                          onChange={(e) =>
                            setNewCard({ ...newCard, cardNumber: formatCardNumber(e.target.value) })
                          }
                          disabled={addingCard}
                          maxLength={19}
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          Mockup: Any 16-digit number is accepted
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cardholderName">Cardholder Name</Label>
                        <Input
                          id="cardholderName"
                          type="text"
                          placeholder="John Doe"
                          value={newCard.cardholderName}
                          onChange={(e) =>
                            setNewCard({ ...newCard, cardholderName: e.target.value })
                          }
                          disabled={addingCard}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="expirationDate">Expiration Date</Label>
                        <Input
                          id="expirationDate"
                          type="text"
                          placeholder="MM/YY"
                          value={newCard.expirationDate}
                          onChange={(e) =>
                            setNewCard({
                              ...newCard,
                              expirationDate: formatExpirationDate(e.target.value),
                            })
                          }
                          disabled={addingCard}
                          maxLength={5}
                          required
                        />
                        <p className="text-xs text-muted-foreground">Format: MM/YY (e.g., 12/25)</p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          disabled={addingCard}
                          className="flex-1"
                        >
                          {addingCard ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Adding...
                            </>
                          ) : (
                            <>
                              <Plus className="mr-2 h-4 w-4" />
                              Add Card
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowAddCard(false);
                            setNewCard({ cardNumber: "", cardholderName: "", expirationDate: "" });
                            setError("");
                          }}
                          disabled={addingCard}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Credit Cards List */}
              {creditCards.length === 0 && !showAddCard ? (
                <div className="text-center py-8">
                  <CreditCardIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    You don't have any saved credit cards.
                  </p>
                  <Button variant="outline" onClick={() => setShowAddCard(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Credit Card
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {creditCards.map((card) => (
                    <label
                      key={card.cardId}
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedCardId === card.cardId
                          ? "border-primary bg-primary/5"
                          : "border-muted hover:border-primary/50"
                      } ${card.isExpired ? "opacity-60" : ""}`}
                    >
                      <input
                        type="radio"
                        name="card"
                        value={card.cardId}
                        checked={selectedCardId === card.cardId}
                        onChange={(e) => setSelectedCardId(e.target.value)}
                        disabled={card.isExpired}
                        className="mr-4"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{card.cardholderName}</p>
                            <p className="text-sm text-muted-foreground">
                              •••• •••• •••• {card.last4}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              Expires: {card.expirationDate}
                            </p>
                            {card.isExpired && (
                              <p className="text-xs text-destructive">Expired</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Items ({totalItems})</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleCheckout}
                disabled={processing || !selectedCardId || creditCards.length === 0}
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCardIcon className="mr-2 h-4 w-4" />
                    Place Order
                  </>
                )}
              </Button>

              {(!selectedCardId || creditCards.length === 0) && (
                <p className="text-xs text-muted-foreground text-center">
                  {creditCards.length === 0
                    ? "Please add a credit card to continue"
                    : "Please select a payment method"}
                </p>
              )}

              <Link href="/user/cart" className="block">
                <Button variant="outline" className="w-full">
                  Back to Cart
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

