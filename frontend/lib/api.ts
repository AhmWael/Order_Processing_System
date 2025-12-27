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
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
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

    // Check if response has content before trying to parse
    const contentType = response.headers.get("content-type");
    const text = await response.text();
    
    if (!text || text.trim().length === 0) {
      return { data: undefined as T };
    }

    if (contentType && contentType.includes("application/json")) {
      try {
        const data = JSON.parse(text);
        return { data };
      } catch (parseError) {
        return { error: "Failed to parse response: " + (parseError as Error).message };
      }
    }

    return { data: text as T };
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
  create: (bookData: BookCreateDto) =>
    apiRequest(`/books`, {
      method: "POST",
      body: JSON.stringify(bookData),
    }),
  update: (isbn: string, bookData: BookUpdateDto) =>
    apiRequest(`/books/${isbn}`, {
      method: "PUT",
      body: JSON.stringify(bookData),
    }),
  delete: (isbn: string) =>
    apiRequest(`/books/${isbn}`, {
      method: "DELETE",
    }),
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

// Admin API - Books
export interface BookCreateDto {
  isbn: string;
  title: string;
  pubId: string;
  pubYear?: number;
  price: number;
  category: string;
  stock: number;
  threshold: number;
  authorIds: string[];
}

export interface BookUpdateDto {
  title: string;
  pubId: string;
  pubYear?: number;
  price: number;
  category: string;
  stock: number;
  threshold: number;
  authorIds: string[];
}

// Admin API - Authors
export interface Author {
  authorId: string;
  authorName: string;
}

export interface AuthorCreateDto {
  authorName: string;
}

export const authorsApi = {
  getAll: () => apiRequest<Author[]>(`/authors`),
  create: (authorData: AuthorCreateDto) =>
    apiRequest(`/authors`, {
      method: "POST",
      body: JSON.stringify(authorData),
    }),
};

// Admin API - Publishers
export interface Publisher {
  publisherId: string;
  publisherName: string;
  address?: string;
}

export interface PublisherCreateDto {
  publisherName: string;
  address?: string;
  phones?: string[];
}

export const publishersApi = {
  getAll: () => apiRequest<Publisher[]>(`/publishers`),
  create: (publisherData: PublisherCreateDto) =>
    apiRequest(`/publishers`, {
      method: "POST",
      body: JSON.stringify(publisherData),
    }),
};

// Admin API - Replenishment Orders
export interface ReplenishmentOrder {
  orderId: string;
  isbn: string;
  orderDate: string;
  quantity: number;
  status: string;
}

export const replenishmentOrdersApi = {
  getAll: () => apiRequest<ReplenishmentOrder[]>(`/replenishment-orders`),
  confirm: (orderId: string) =>
    apiRequest(`/replenishment-orders/${orderId}/confirm`, {
      method: "PUT",
    }),
};

// Admin API - Reports
export interface TotalSales {
  totalSales: number;
  totalOrders: number;
  totalBooksSold: number;
}

export interface TopCustomer {
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  totalPurchaseAmount: number;
  totalOrders: number;
}

export interface TopSellingBook {
  isbn: string;
  title: string;
  totalCopiesSold: number;
  totalRevenue: number;
  timesOrdered: number;
}

export interface BookOrderCount {
  isbn: string;
  title: string;
  replenishmentOrderCount: number;
  totalQuantityOrdered: number;
}

export const reportsApi = {
  getSalesPreviousMonth: () =>
    apiRequest<TotalSales>(`/reports/sales/previous-month`),
  getSalesByDate: (date: string) =>
    apiRequest<TotalSales>(`/reports/sales/by-date?date=${date}`),
  getTop5Customers: () => apiRequest<TopCustomer[]>(`/reports/customers/top-5`),
  getTop10Books: () => apiRequest<TopSellingBook[]>(`/reports/books/top-10`),
  getBookReplenishmentOrderCount: (isbn: string) =>
    apiRequest<BookOrderCount>(`/reports/books/${isbn}/replenishment-orders`),
};

// Admin API - Users
export interface User {
  uId: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  role: string;
}

export interface UserRegisterDto {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
}

export const usersApi = {
  getAll: () => apiRequest<User[]>(`/users`),
  getByUsername: (username: string) => apiRequest<User>(`/users/${username}`),
};

export const authApi = {
  registerAdmin: (userData: UserRegisterDto) =>
    apiRequest(`/auth/register-admin`, {
      method: "POST",
      body: JSON.stringify(userData),
    }),
};

