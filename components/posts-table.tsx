"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronUp,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

type Post = {
  id?: string;
  title: string;
  body: string;
  category: string;
  tags: string[];
  createdAt?: string;
};

type SortOrder = "asc" | "desc" | null;

export function PostsTable() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);
  const [titleSortOrder, setTitleSortOrder] = useState<SortOrder>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const postsPerPage = 10;
  const totalPosts = 50;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`/api/mock/posts?count=${totalPosts}`);
        const data = await response.json();
        console.log("API Response:", data);
        console.log("Is array:", Array.isArray(data));

        // Handle different data structures
        let postsArray: Post[] = [];

        if (Array.isArray(data)) {
          postsArray = data;
        } else if (data && data.items && Array.isArray(data.items)) {
          // Handle case where posts are in items array
          postsArray = data.items;
        } else if (data && data.posts && Array.isArray(data.posts)) {
          // Handle case where posts are nested in an object
          postsArray = data.posts;
        } else if (data && typeof data === "object") {
          // Handle case where data is an object with post properties
          // Convert object values to array if they look like posts
          const values = Object.values(data);
          if (
            values.length > 0 &&
            values.every(
              (item) =>
                typeof item === "object" &&
                item !== null &&
                "title" in item &&
                "body" in item
            )
          ) {
            postsArray = values as Post[];
          } else {
            console.error(
              "Expected array or object with posts but got:",
              typeof data,
              data
            );
          }
        } else {
          console.error("Expected array but got:", typeof data, data);
        }

        console.log("Processed posts array:", postsArray);

        setPosts(postsArray);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [totalPosts]);

  const sortPostsByCreatedAt = () => {
    const newSortOrder: SortOrder =
      sortOrder === null ? "desc" : sortOrder === "desc" ? "asc" : "desc";

    setSortOrder(newSortOrder);
    setTitleSortOrder(null); // Reset title sort when sorting by date

    const sortedPosts = [...posts].sort((a, b) => {
      const dateA = new Date(a.createdAt || "").getTime();
      const dateB = new Date(b.createdAt || "").getTime();

      if (newSortOrder === "asc") {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });

    setPosts(sortedPosts);
  };

  const sortPostsByTitle = () => {
    const newSortOrder: SortOrder =
      titleSortOrder === null
        ? "asc"
        : titleSortOrder === "asc"
        ? "desc"
        : "asc";

    setTitleSortOrder(newSortOrder);
    setSortOrder(null); // Reset date sort when sorting by title

    const sortedPosts = [...posts].sort((a, b) => {
      const titleA = a.title.toLowerCase();
      const titleB = b.title.toLowerCase();

      if (newSortOrder === "asc") {
        return titleA.localeCompare(titleB);
      } else {
        return titleB.localeCompare(titleA);
      }
    });

    setPosts(sortedPosts);
  };

  if (loading) {
    return (
      <Card>
        <div className="p-8 text-center">Loading posts...</div>
      </Card>
    );
  }

  if (!Array.isArray(posts) || posts.length === 0) {
    return (
      <Card>
        <div className="p-8 text-center">No posts found.</div>
      </Card>
    );
  }

  // Filter posts based on search query
  const filteredPosts = posts.filter((post) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      post.title.toLowerCase().includes(searchLower) ||
      post.body.toLowerCase().includes(searchLower)
    );
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const currentPosts = filteredPosts.slice(startIndex, endIndex);

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  return (
    <>
      <div className="flex flex-row gap-4 py-4">
        <Input
          placeholder="Search by title or body..."
          className="inline-flex"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
        />
       
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  Title
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={sortPostsByTitle}
                    className="h-6 w-6 p-0"
                  >
                    {titleSortOrder === "asc" ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : titleSortOrder === "desc" ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <div className="flex flex-col">
                        <ChevronUp className="h-3 w-3 -mb-1" />
                        <ChevronDown className="h-3 w-3" />
                      </div>
                    )}
                  </Button>
                </div>
              </TableHead>
              <TableHead>Body</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  Created At
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={sortPostsByCreatedAt}
                    className="h-6 w-6 p-0"
                  >
                    {sortOrder === "asc" ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : sortOrder === "desc" ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <div className="flex flex-col">
                        <ChevronUp className="h-3 w-3 -mb-1" />
                        <ChevronDown className="h-3 w-3" />
                      </div>
                    )}
                  </Button>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentPosts.map((post, index) => (
              <TableRow key={post.id || startIndex + index}>
                <TableCell>{post.id || startIndex + index + 1}</TableCell>
                <TableCell className="font-medium">{post.title}</TableCell>
                <TableCell className="max-w-[400px]">
                  <p className="line-clamp-2 text-sm">{post.body}</p>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{post.category}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {post.tags?.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  {post.createdAt
                    ? new Date(post.createdAt).toLocaleDateString()
                    : "N/A"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between px-4 py-4">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to{" "}
            {Math.min(endIndex, filteredPosts.length)} of {filteredPosts.length}{" "}
            posts
            {searchQuery && ` (filtered from ${posts.length} total)`}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft />
            </Button>
            <div className="text-sm">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
}
