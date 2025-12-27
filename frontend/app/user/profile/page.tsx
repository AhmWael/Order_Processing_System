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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { isAuthenticated, getCurrentUser } from "@/lib/auth";
import { apiRequest, creditCardsApi, CreditCard, CreditCardAddDto } from "@/lib/api";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  CreditCard as CreditCardIcon,
  Plus,
  X,
  Trash2,
} from "lucide-react";

interface UserProfile {
  uId: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  role: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
  });
  
  // Credit card management state
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [loadingCards, setLoadingCards] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [addingCard, setAddingCard] = useState(false);
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);
  const [newCard, setNewCard] = useState({
    cardNumber: "",
    cardholderName: "",
    expirationDate: "",
  });
  const [cardError, setCardError] = useState("");
  const [cardSuccess, setCardSuccess] = useState("");

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

    loadProfile();
    loadCreditCards();
  }, [router]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const currentUser = getCurrentUser();
      if (!currentUser) return;

      const response = await apiRequest<UserProfile>(`/users/${currentUser.username}`);
      if (response.data) {
        setProfile(response.data);
        setFormData({
          firstName: response.data.firstName || "",
          lastName: response.data.lastName || "",
          email: response.data.email || "",
          phone: response.data.phone || "",
          address: response.data.address || "",
        });
      } else if (response.error) {
        setError("Failed to load profile: " + response.error);
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const loadCreditCards = async () => {
    try {
      setLoadingCards(true);
      const response = await creditCardsApi.getAll();
      if (response.data) {
        setCreditCards(response.data);
      } else if (response.error) {
        setCardError("Failed to load credit cards: " + response.error);
      }
    } catch (error) {
      console.error("Failed to load credit cards:", error);
      setCardError("Failed to load credit cards");
    } finally {
      setLoadingCards(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "");
    const formatted = digits.match(/.{1,4}/g)?.join(" ") || digits;
    return formatted.slice(0, 19);
  };

  const formatExpirationDate = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length >= 2) {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
    }
    return digits;
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setCardError("");
    setCardSuccess("");

    if (!newCard.cardNumber || !newCard.cardholderName || !newCard.expirationDate) {
      setCardError("Please fill in all fields");
      return;
    }

    const expDateRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!expDateRegex.test(newCard.expirationDate)) {
      setCardError("Expiration date must be in MM/YY format (e.g., 12/25)");
      return;
    }

    setAddingCard(true);
    try {
      const cardData: CreditCardAddDto = {
        cardNumber: newCard.cardNumber.replace(/\s/g, ""),
        cardholderName: newCard.cardholderName,
        expirationDate: newCard.expirationDate,
      };

      const response = await creditCardsApi.addCard(cardData);

      if (response.error) {
        setCardError(response.error);
      } else {
        setCardSuccess("Credit card added successfully!");
        setNewCard({
          cardNumber: "",
          cardholderName: "",
          expirationDate: "",
        });
        setShowAddCard(false);
        await loadCreditCards();
        // Clear success message after 3 seconds
        setTimeout(() => setCardSuccess(""), 3000);
      }
    } catch (error: any) {
      setCardError("Failed to add credit card: " + (error.message || "Unknown error"));
    } finally {
      setAddingCard(false);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm("Are you sure you want to delete this credit card?")) {
      return;
    }

    setDeletingCardId(cardId);
    setCardError("");
    setCardSuccess("");

    try {
      const response = await creditCardsApi.deleteCard(cardId);

      if (response.error) {
        setCardError(response.error);
      } else {
        setCardSuccess("Credit card deleted successfully!");
        await loadCreditCards();
        // Clear success message after 3 seconds
        setTimeout(() => setCardSuccess(""), 3000);
      }
    } catch (error: any) {
      setCardError("Failed to delete credit card: " + (error.message || "Unknown error"));
    } finally {
      setDeletingCardId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.firstName || !formData.lastName || !formData.email) {
      setError("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) return;

      // Note: This assumes there's an update endpoint. If not, we'll need to create one.
      // For now, we'll show a message that profile updates need backend support
      setError("Profile update functionality requires backend API endpoint. Please contact support.");
      
      // Uncomment when backend endpoint is available:
      // const response = await apiRequest(`/users/${currentUser.username}`, {
      //   method: "PUT",
      //   body: JSON.stringify({
      //     FirstName: formData.firstName,
      //     LastName: formData.lastName,
      //     Email: formData.email,
      //     Phone: formData.phone || null,
      //     Address: formData.address || null,
      //   }),
      // });
      
      // if (response.error) {
      //   setError(response.error);
      // } else {
      //   setSuccess("Profile updated successfully!");
      //   await loadProfile();
      // }
    } catch (error: any) {
      setError("Failed to update profile: " + (error.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-muted-foreground">Failed to load profile</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <Link href="/user/home">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal information and account settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your profile information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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

            {/* Username (read-only) */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <Input
                  id="username"
                  type="text"
                  value={profile.username}
                  disabled
                  className="pl-10 bg-muted"
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">Username cannot be changed</p>
            </div>

            {/* First Name and Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  disabled={saving}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  disabled={saving}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  disabled={saving}
                  className="pl-10"
                  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                  required
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  disabled={saving}
                  className="pl-10"
                  placeholder="(555) 123-4567"
                />
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">Optional</p>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Shipping Address</Label>
              <div className="relative">
                <Input
                  id="address"
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  disabled={saving}
                  className="pl-10"
                  placeholder="123 Main St, City, State, ZIP"
                />
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">Optional</p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={saving} className="flex-1">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
              <Link href="/user/home" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Credit Cards Section */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCardIcon className="h-5 w-5" />
                Credit Cards
              </CardTitle>
              <CardDescription>
                Manage your saved credit cards for quick checkout
              </CardDescription>
            </div>
            {!showAddCard && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowAddCard(true);
                  setCardError("");
                  setCardSuccess("");
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Card
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {cardError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{cardError}</AlertDescription>
            </Alert>
          )}

          {cardSuccess && (
            <Alert className="bg-green-50 border-green-200 mb-4">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{cardSuccess}</AlertDescription>
            </Alert>
          )}

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
                      setCardError("");
                      setCardSuccess("");
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
                        setNewCard({ ...newCard, expirationDate: formatExpirationDate(e.target.value) })
                      }
                      disabled={addingCard}
                      maxLength={5}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Format: MM/YY (e.g., 12/25)
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={addingCard} className="flex-1">
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
                        setCardError("");
                        setCardSuccess("");
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
          {loadingCards ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : creditCards.length === 0 && !showAddCard ? (
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
                <div
                  key={card.cardId}
                  className={`flex items-center justify-between p-4 border rounded-lg ${
                    card.isExpired ? "opacity-60 bg-muted/50" : "bg-card"
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <CreditCardIcon className="h-5 w-5 text-muted-foreground" />
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
                            <p className="text-xs text-destructive font-medium">Expired</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteCard(card.cardId)}
                    disabled={deletingCardId === card.cardId}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    {deletingCardId === card.cardId ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

