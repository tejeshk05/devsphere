"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { GitHubRepo } from "@/types/github";

export interface ImportResult {
  imported: number;
  skipped: number;
  error?: string;
}

export interface BookmarkContextType {
  bookmarks: GitHubRepo[];
  isBookmarked: (repoId: number) => boolean;
  toggleBookmark: (repo: GitHubRepo) => void;
  removeBookmark: (repoId: number) => void;
  clearBookmarks: () => void;
  importBookmarks: (items: unknown) => ImportResult;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

const STORAGE_KEY = "devsphere_bookmarks_v1";

/**
 * Validates whether an imported object satisfies the minimal GitHubRepo contract
 */
function isValidRepo(item: any): item is GitHubRepo {
  return (
    item &&
    typeof item === "object" &&
    typeof item.id === "number" &&
    typeof item.name === "string" &&
    typeof item.full_name === "string" &&
    typeof item.html_url === "string" &&
    item.owner &&
    typeof item.owner === "object" &&
    typeof item.owner.login === "string"
  );
}

export function BookmarkProvider({ children }: { children: React.ReactNode }) {
  const [bookmarks, setBookmarks] = useState<GitHubRepo[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setBookmarks(parsed.filter(isValidRepo));
        }
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

  const importBookmarks = (rawItems: unknown): ImportResult => {
    if (!Array.isArray(rawItems)) {
      return { imported: 0, skipped: 0, error: "Import file must contain a JSON array." };
    }

    const currentMap = new Map<number, GitHubRepo>(bookmarks.map((b) => [b.id, b]));
    let importedCount = 0;
    let skippedCount = 0;

    for (const item of rawItems) {
      if (isValidRepo(item)) {
        if (!currentMap.has(item.id)) {
          currentMap.set(item.id, item);
          importedCount++;
        } else {
          skippedCount++; // Duplicate already exists
        }
      } else {
        skippedCount++; // Malformed entry
      }
    }

    const merged = Array.from(currentMap.values());
    saveBookmarks(merged);

    return { imported: importedCount, skipped: skippedCount };
  };

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
        importBookmarks,
      }}
    >
      {children}
    </BookmarkContext.Provider>
  );
}

export function useBookmarks(): BookmarkContextType {
  const context = useContext(BookmarkContext);
  if (!context) {
    return {
      bookmarks: [],
      isBookmarked: () => false,
      toggleBookmark: () => {},
      removeBookmark: () => {},
      clearBookmarks: () => {},
      importBookmarks: () => ({ imported: 0, skipped: 0 }),
    };
  }
  return context;
}
