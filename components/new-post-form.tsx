"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useSession } from "next-auth/react";
import useSWRMutation from "swr/mutation";

type Post = {
  title: string;
  body: string;
  category: string;
  tags: string[];
};

type NewPostFormProps = {
  onSubmit: (post: Post) => void;
};

const BLOCKED_WORDS = ["캄보디아", "프놈펜", "불법체류", "텔레그램"];
const CATEGORIES = ["NOTICE", "QNA", "FREE"];
const TAGS = [];

export function NewPostForm({ onSubmit }: NewPostFormProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { data: session, status } = useSession();

  // Debug logging
  console.log("Session in NewPostForm:", session);
  console.log("AccessToken:", session?.token);

  const containsBlockedWords = (text: string): boolean => {
    return BLOCKED_WORDS.some((word) => text.includes(word));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    } else if (containsBlockedWords(title)) {
      newErrors.title = "Title contains blocked words";
    }

    if (!body.trim()) {
      newErrors.body = "Body is required";
    } else if (containsBlockedWords(body)) {
      newErrors.body = "Body contains blocked words";
    }

    if (!category) {
      newErrors.category = "Please select a category";
    }

    if (tags.length === 0) {
      newErrors.tags = "Please add at least one tag";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      if (containsBlockedWords(trimmedTag)) {
        setErrors({ ...errors, tags: "Tag contains blocked words" });
        return;
      }
      setTags([...tags, trimmedTag]);
      setTagInput("");
      setErrors({ ...errors, tags: "" });
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== "authenticated") {
      console.error("You are not logged in.");
      return;
    }
    const token = session.token;

    if (validateForm()) {
      const postData = {
        title: title.trim(),
        body: body.trim(),
        category,
        tags,
      };

      try {
        const response = await fetch("/api/posts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(postData),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
          
        const result = await response.json();
        onSubmit(result);
        // Reset form
        setTitle("");
        setBody("");
        setCategory("");
        setTags([]);
        setTagInput("");
        setErrors({});
      } catch (error) {
        console.error("Error creating post:", error);
        setErrors({
          ...errors,
          submit:
            error instanceof Error
              ? error.message
              : "Failed to create post. Please try again.",
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email */}
      <div className="space-y-2">
        <Label>Email</Label>
        <Input disabled placeholder={session?.user?.email ?? ""} />
      </div>

      <div className="space-y-2">
        <Label>User Id</Label>
        <Input disabled placeholder={session?.user?.id ?? ""} />
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          placeholder="Enter post title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setErrors({ ...errors, title: "" });
          }}
          className={errors.title ? "border-destructive" : ""}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title}</p>
        )}
      </div>

      {/* Body */}
      <div className="space-y-2">
        <Label htmlFor="body">
          Body <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="body"
          placeholder="Enter post content"
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            setErrors({ ...errors, body: "" });
          }}
          className={errors.body ? "border-destructive" : ""}
          rows={5}
        />
        {errors.body && (
          <p className="text-sm text-destructive">{errors.body}</p>
        )}
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category">
          Category <span className="text-destructive">*</span>
        </Label>
        <Select
          value={category}
          onValueChange={(value) => {
            setCategory(value);
            setErrors({ ...errors, category: "" });
          }}
        >
          <SelectTrigger
            id="category"
            className={errors.category ? "border-destructive" : ""}
          >
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-sm text-destructive">{errors.category}</p>
        )}
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label htmlFor="tags">
          Tags <span className="text-destructive">*</span>
        </Label>
        <div className="flex gap-2">
          <Input
            id="tags"
            placeholder="Enter a tag"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddTag();
              }
            }}
          />
          <Button type="button" onClick={handleAddTag} variant="secondary">
            Add
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 rounded-full hover:bg-secondary-foreground/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        {errors.tags && (
          <p className="text-sm text-destructive">{errors.tags}</p>
        )}
      </div>

      {/* Blocked Words Warning */}
      <div className="rounded-lg border border-muted bg-muted/50 p-4">
        <p className="text-sm text-muted-foreground">
          <strong>Note:</strong> Posts containing the following words will be
          blocked: {BLOCKED_WORDS.join(", ")}
        </p>
      </div>

      {/* Submit Error */}
      {errors.submit && (
        <p className="text-sm text-destructive">{errors.submit}</p>
      )}
      {/* Submit Button */}
      <Button type="submit" className="w-full" disabled={status === "loading"}>
        Create Post
      </Button>
    </form>
  );
}
