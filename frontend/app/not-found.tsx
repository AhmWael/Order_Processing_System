"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, Home, ArrowLeft, BookOpen } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 px-4">
      <div className="max-w-2xl w-full text-center">
        <Card className="border-2">
          <CardHeader className="space-y-4">
            <div className="flex flex-col items-center justify-center mb-4 space-y-4">
              <BookOpen className="h-20 w-20 text-primary/40" />
              <div className="text-6xl font-bold text-primary">404</div>
            </div>
            <CardTitle className="text-3xl font-bold">
              Page Not Found
            </CardTitle>
            <CardDescription className="text-lg">
              Oops! It seems this page has wandered off the bookshelf.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-6 border-l-4 border-primary">
              <p className="text-lg italic text-muted-foreground">
                "Not all those who wander are lost; but this page certainly is."
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                — Inspired by J.R.R. Tolkien
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/user/home">
                <Button size="lg" className="w-full sm:w-auto">
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Button>
              </Link>
              <Link href="/user/books">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  <Book className="mr-2 h-4 w-4" />
                  Browse Books
                </Button>
              </Link>
              <Button
                size="lg"
                variant="ghost"
                onClick={() => window.history.back()}
                className="w-full sm:w-auto"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                The page you're looking for might have been moved, deleted, or never existed.
                <br />
                But don't worry, there are plenty of great books waiting for you!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

