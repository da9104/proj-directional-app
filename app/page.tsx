"use client";
import { useState, useCallback, useEffect } from "react";
import { PostsTable } from "@/components/posts-table";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import SignInCard from "@/components/signin-card";
import { AlertCircleIcon, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { NewPostForm } from "@/components/new-post-form";

type Post = {
  id?: string;
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

  const fetchUserPosts = useCallback(async () => {
    const token = session?.token;

    if (status !== "authenticated" || !session?.token) {
      console.log(
        "Skipping authenticated fetch: status=",
        status,
        "hasToken=",
        !!session?.token
      );
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/posts", {
        headers: {
          "Content-Type": "application/json", // Good practice to include
        },
      });

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
      setUserPosts(data);
    } catch (error) {
      console.error("Error fetching user posts:", error);
      setUserPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, [status, session?.token]);

  useEffect(() => {
    fetchUserPosts();
  }, [fetchUserPosts]);

  const handlePostCreated = () => {
    console.log("submitted");
    setOpenDialog(false);
    fetchUserPosts();
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

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button
              onClick={(e) => {
                e.preventDefault();
                setOpenDialog(true);
              }}
            >
              <Plus /> New Post
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle> Upload a new post</DialogTitle>
            <NewPostForm onSubmit={handlePostCreated} />
          </DialogContent>
        </Dialog>

        <div>
          {userPosts.map((post, index) => (
            <div key={index}>{post.title}</div>
          ))}
        </div>

        <PostsTable />
      </div>
    </main>
  );
}
