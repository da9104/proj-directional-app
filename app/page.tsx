"use client";
import { useState, useCallback, useEffect } from "react";
import { PostsTable } from "@/components/posts-table";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import SignInCard from "@/components/signin-card";
import {
  AlertCircleIcon,
  Plus,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Ellipsis,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { NewPostForm } from "@/components/new-post-form";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Post = {
  id?: string;
  userId: string;
  title: string;
  body: string;
  category: string;
  tags: string[];
  createdAt?: string;
};

export default function Home() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);
  const [titleSortOrder, setTitleSortOrder] = useState<"asc" | "desc" | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchUserPosts = useCallback(async () => {
    if (status !== "authenticated") {
      console.log("Skipping authenticated fetch: status=", status);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(
        "https://fe-hiring-rest-api.vercel.app/posts",
        {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        // Log the 401 error detail for debugging
        const errorData = await response.json();
        console.error(
          "Authenticated fetch failed:",
          response.status,
          errorData
        );
        setUserPosts([]);
        return;
      }

      const data = await response.json();
      console.log("Successfully fetched user posts:", data);
      // Access the items array from the response
      setUserPosts(Array.isArray(data.items) ? data.items : []);
    } catch (error) {
      console.error("Error fetching user posts:", error);
      setUserPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, [session?.accessToken, status]);

  useEffect(() => {
    fetchUserPosts();
  }, [fetchUserPosts]);

  const handlePostCreated = () => {
    console.log("submitted");
    setOpenDialog(false);
    setEditingPost(null);
    fetchUserPosts();
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setOpenDialog(true);
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const response = await fetch(
        `https://fe-hiring-rest-api.vercel.app/posts/${postId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.error("Failed to delete post:", response.status);
        return;
      }

      console.log("Post deleted successfully");
      fetchUserPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const sortPostsByTitle = () => {
    setTitleSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const sortPostsByCreatedAt = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const filteredPosts = userPosts;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  if (!session) {
    return (
      <div className="flex flex-col w-full min-h-screen items-center justify-center bg-black dark:bg-black">
        <Alert variant="destructive" className="max-w-[450px] mb-10">
          <AlertCircleIcon />
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>Please login and try again.</AlertDescription>
        </Alert>
        <SignInCard />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-8 w-full">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
            Posts Management
          </h1>
          <p className="mt-2 text-pretty text-muted-foreground">
            Manage and organize your posts with advanced filtering and search
            <Badge className="ml-2 bg-green-700">
              {status} User: {session?.user?.email || session?.user?.name}{" "}
            </Badge>
          </p>
        </div>

        <Dialog
          open={openDialog}
          onOpenChange={(open) => {
            setOpenDialog(open);
            if (!open) setEditingPost(null);
          }}
        >
          <DialogTrigger asChild>
            <Button
              onClick={(e) => {
                e.preventDefault();
                setEditingPost(null);
                setOpenDialog(true);
              }}
            >
              <Plus /> New Post
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>
              {editingPost ? "Edit Post" : "Upload a new post"}
            </DialogTitle>
            <NewPostForm
              onSubmit={handlePostCreated}
              initialData={editingPost || undefined}
              mode={editingPost ? "edit" : "create"}
            />
          </DialogContent>
        </Dialog>

        <div className="w-full mt-6 space-y-4">
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
                {isLoading ? (
                  <p className="text-muted-foreground">Loading posts...</p>
                ) : userPosts.length > 0 ? (
                  userPosts.map((post, index) => (
                    <TableRow key={post.id || startIndex + index}>
                      <TableCell>
                        {(post.userId = "by.kangdami@gmail.com")}
                      </TableCell>
                      <TableCell className="font-medium">
                        {post.title}
                      </TableCell>
                      <TableCell className="max-w-[400px]">
                        <p className="line-clamp-2 text-sm">{post.body}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{post.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {post.tags?.map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs"
                            >
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
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                              size="icon"
                            >
                              <Ellipsis />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-32">
                            <DropdownMenuItem>
                              <Button
                                variant="ghost"
                                className="w-full h-10"
                                onClick={() => handleEditPost(post)}
                              >
                                Edit
                              </Button>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" className="w-full h-10">
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Are you absolutely sure?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will
                                    permanently delete this post from the
                                    server.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      post.id && handleDeletePost(post.id)
                                    }
                                  >
                                    Continue
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <p className="text-muted-foreground">
                    No posts found. Create your first post!
                  </p>
                )}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between px-4 py-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to{" "}
                {Math.min(endIndex, filteredPosts.length)} of{" "}
                {filteredPosts.length} posts
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
        </div>

        <PostsTable />
      </div>
    </main>
  );
}
