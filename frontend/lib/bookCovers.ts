/**
 * Get book cover image URL from Open Library Covers API
 * @param isbn - Book ISBN (can include hyphens)
 * @param size - Cover size: 'S' (small), 'M' (medium), 'L' (large)
 * @returns URL to the book cover image
 */
export function getBookCoverUrl(isbn: string, size: 'S' | 'M' | 'L' = 'M'): string {
  if (!isbn) return '';
  
  // Open Library API accepts ISBN with or without hyphens
  // URL pattern: https://covers.openlibrary.org/b/isbn/{isbn}-{size}.jpg
  return `https://covers.openlibrary.org/b/isbn/${isbn}-${size}.jpg`;
}

/**
 * Check if a book cover exists by trying to load it
 * @param isbn - Book ISBN
 * @param size - Cover size
 * @returns Promise that resolves to true if cover exists, false otherwise
 */
export async function checkCoverExists(isbn: string, size: 'S' | 'M' | 'L' = 'M'): Promise<boolean> {
  if (!isbn) return false;
  
  try {
    const url = getBookCoverUrl(isbn, size);
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}


