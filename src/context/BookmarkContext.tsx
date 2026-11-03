"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { GitHubRepo } from "@/types/github";

interface BookmarkContextType {
  bookmarks: GitHubRepo[];
  isBookmarked: (repoId: number) => boolean;
  toggleBookmark: (repo: GitHubRepo) => void;
  removeBookmark: (repoId: number) => void;
  clearBookmarks: () => void;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

const STORAGE_KEY = "devsphere_bookmarks_v1";

export function BookmarkProvider({ children }: { children: React.ReactNode }) {
  const [bookmarks, setBookmarks] = useState<GitHubRepo[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setBookmarks(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load bookmarks from storage:", e);
    }
  }, []);

  const saveBookmarks = (items: GitHubRepo[]) => {
    setBookmarks(items);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Failed to persist bookmarks:", e);
    }
  };

  const isBookmarked = (repoId: number) => {
    return bookmarks.some((b) => b.id === repoId);
  };

  const toggleBookmark = (repo: GitHubRepo) => {
    if (isBookmarked(repo.id)) {
      saveBookmarks(bookmarks.filter((b) => b.id !== repo.id));
    } else {
      saveBookmarks([repo, ...bookmarks]);
    }
  };

  const removeBookmark = (repoId: number) => {
    saveBookmarks(bookmarks.filter((b) => b.id !== repoId));
  };

  const clearBookmarks = () => {
    saveBookmarks([]);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <BookmarkContext.Provider
      value={{
        bookmarks,
        isBookmarked,
        toggleBookmark,
        removeBookmark,
        clearBookmarks,
      }}
    >
      {children}
    </BookmarkContext.Provider>
  );
}

export function useBookmarks() {
  const context = useContext(BookmarkContext);
  if (!context) {
    // Provide default fallback during SSR or pre-mount
    return {
      bookmarks: [],
      isBookmarked: () => false,
      toggleBookmark: () => {},
      removeBookmark: () => {},
      clearBookmarks: () => {},
    };
  }
  return context;
}

