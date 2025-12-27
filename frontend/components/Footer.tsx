import React from "react";
import Link from "next/link";
import { Book } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Book className="h-5 w-5" />
              <span className="text-lg font-bold">BookStore</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your one-stop shop for all your reading needs. Discover thousands of books
              from your favorite authors.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/user/books" className="hover:text-primary transition-colors">
                  Browse Books
                </Link>
              </li>
              <li>
                <Link href="/user/cart" className="hover:text-primary transition-colors">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link href="/user/orders" className="hover:text-primary transition-colors">
                  My Orders
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Email: support@bookstore.com</li>
              <li>Phone: +1 (555) 123-4567</li>
              <li>Address: 123 Book Street, Reading City</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} BookStore. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
