/**
 * Decode JWT token to get user information
 */
export function decodeToken(token: string): any {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

/**
 * Get current user info from token
 */
export function getCurrentUser() {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  if (!token) return null;
  
  const decoded = decodeToken(token);
  if (!decoded) return null;
  
  return {
    username: decoded.sub || decoded.username,
    role: decoded.role,
    uid: decoded.uid,
  };
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  const token = localStorage.getItem("token");
  if (!token) return false;
  
  const decoded = decodeToken(token);
  if (!decoded) return false;
  
  // Check if token is expired
  if (decoded.exp) {
    const expirationTime = decoded.exp * 1000;
    if (Date.now() >= expirationTime) {
      localStorage.removeItem("token");
      return false;
    }
  }
  
  return true;
}

/**
 * Check if user has a specific role
 */
export function hasRole(role: string): boolean {
  const user = getCurrentUser();
  return user?.role === role;
}


