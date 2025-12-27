const API_BASE_URL = "http://localhost:8080/api";

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

/**
 * Get the JWT token from localStorage
 */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

/**
 * Make an authenticated API request
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.title || errorMessage;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }
      return { error: errorMessage };
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return { data: undefined as T };
    }

    const data = await response.json();
    return { data };
  } catch (error: any) {
    return {
      error: error.message || "Network error. Please check your connection.",
    };
  }
}

// Books API
export const booksApi = {
  getAll: (category?: string) => {
    const query = category ? `?category=${encodeURIComponent(category)}` : "";
    return apiRequest<Book[]>(`/books${query}`);
  },
  getByIsbn: (isbn: string) => apiRequest<Book>(`/books/${isbn}`),
};

// Cart API
export const cartApi = {
  getCart: () => apiRequest<CartItem[]>(`/cart`),
  addItem: (item: { isbn: string; quantity: number }) =>
    apiRequest(`/cart/items`, {
      method: "POST",
      body: JSON.stringify(item),
    }),
  removeItem: (isbn: string) =>
    apiRequest(`/cart/items/${isbn}`, {
      method: "DELETE",
    }),
  checkout: (checkoutData: CheckoutDto) =>
    apiRequest(`/cart/checkout`, {
      method: "POST",
      body: JSON.stringify(checkoutData),
    }),
};

// Credit Cards API
export const creditCardsApi = {
  getAll: () => apiRequest<CreditCard[]>(`/credit-cards`),
  getById: (cardId: string) => apiRequest<CreditCard>(`/credit-cards/${cardId}`),
  addCard: (cardData: CreditCardAddDto) =>
    apiRequest<{ cardId: string; message: string }>(`/credit-cards`, {
      method: "POST",
      body: JSON.stringify(cardData),
    }),
  deleteCard: (cardId: string) =>
    apiRequest(`/credit-cards/${cardId}`, {
      method: "DELETE",
    }),
};

// Types
export interface Book {
  isbn: string;
  title: string;
  pubId: string;
  pubYear?: number;
  price: number;
  category: string;
  stock: number;
  threshold: number;
  authors: string[];
}

export interface CartItem {
  isbn: string;
  title: string;
  price: number;
  quantity: number;
  total: number;
}

export interface CreditCard {
  cardId: string;
  cardholderName: string;
  last4: string;
  expirationDate: string; // MM/YY format
  isExpired: boolean;
}

export interface CreditCardAddDto {
  cardNumber: string;
  cardholderName: string;
  expirationDate: string; // MM/YY format
}

export interface CheckoutDto {
  cardId: string; // GUID as string
}

// Orders API
export const ordersApi = {
  getAll: () => apiRequest<CustomerOrder[]>(`/orders`),
  getById: (orderId: string) => apiRequest<CustomerOrder>(`/orders/${orderId}`),
  getItems: (orderId: string) => apiRequest<CustomerOrderItem[]>(`/orders/${orderId}/items`),
};

// Types for Orders
export interface CustomerOrderItem {
  isbn: string;
  title: string;
  quantity: number;
  price: number;
}

export interface CustomerOrder {
  orderId: string;
  orderDate: string;
  totalPrice: number;
  items?: CustomerOrderItem[];
}

