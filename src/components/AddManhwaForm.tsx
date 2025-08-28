/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import * as React from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "./ui/sheet";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./ui/select";

interface AddManhwaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdded?: () => void;
}

export const AddManhwaForm: React.FC<AddManhwaFormProps> = ({
  open,
  onOpenChange,
  onAdded,
}) => {
  const [manhwa, setManhwa] = React.useState({
    manhwa_title: "",
    original_title: "",
    author: "",
    status: "ongoing" as "ongoing" | "hiatus" | "completed" | "dropped",
    total_chapters: 0,
    current_chapter: 0,
    reading_status: "plan-to-read" as
      | "reading"
      | "plan-to-read"
      | "completed"
      | "on-hold"
      | "dropped",
    genres: "",
    star_rating: 0,
    notes: "",
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleChange = (key: string, value: any) => {
    setManhwa((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.from("manhwa").insert([
        {
          manhwa_title: manhwa.manhwa_title,
          original_title: manhwa.original_title,
          author: manhwa.author,
          status: manhwa.status,
          total_chapters: manhwa.total_chapters,
          current_chapter: manhwa.current_chapter,
          reading_status: manhwa.reading_status,
          genres: manhwa.genres.split(",").map((g) => g.trim()),
          star_rating: manhwa.star_rating,
          notes: manhwa.notes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);
      if (error) throw error;

      setManhwa({
        manhwa_title: "",
        original_title: "",
        author: "",
        status: "ongoing",
        total_chapters: 0,
        current_chapter: 0,
        reading_status: "plan-to-read",
        genres: "",
        star_rating: 0,
        notes: "",
      });

      onAdded?.();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Error adding manhwa");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="min-w-md px-6">
        <SheetHeader>
          <SheetTitle>Add New Manhwa</SheetTitle>
          <SheetDescription>
            Fill the details to add a new manhwa.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <Label className="mb-2">Title</Label>
            <Input
              value={manhwa.manhwa_title}
              onChange={(e) => handleChange("manhwa_title", e.target.value)}
            />
          </div>
          <div>
            <Label className="mb-2">Original Title</Label>
            <Input
              value={manhwa.original_title}
              onChange={(e) => handleChange("original_title", e.target.value)}
            />
          </div>
          <div>
            <Label className="mb-2">Author</Label>
            <Input
              value={manhwa.author}
              onChange={(e) => handleChange("author", e.target.value)}
            />
          </div>
          <div>
            <Label className="mb-2">Status</Label>
            <Select
              onValueChange={(val: any) => handleChange("status", val)}
              value={manhwa.status}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="hiatus">Hiatus</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="dropped">Dropped</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-2">Total Chapters</Label>
            <Input
              type="number"
              value={manhwa.total_chapters}
              onChange={(e) =>
                handleChange("total_chapters", Number(e.target.value))
              }
            />
          </div>
          <div>
            <Label className="mb-2">Current Chapter</Label>
            <Input
              type="number"
              value={manhwa.current_chapter}
              onChange={(e) =>
                handleChange("current_chapter", Number(e.target.value))
              }
            />
          </div>
          <div>
            <Label className="mb-2">Reading Status</Label>
            <Select
              onValueChange={(val: any) => handleChange("reading_status", val)}
              value={manhwa.reading_status}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select reading status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reading">Reading</SelectItem>
                <SelectItem value="plan-to-read">Plan to Read</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
                <SelectItem value="dropped">Dropped</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-2">Genres (comma separated)</Label>
            <Input
              value={manhwa.genres}
              onChange={(e) => handleChange("genres", e.target.value)}
            />
          </div>
          <div>
            <Label className="mb-2">Star Rating (0-5)</Label>
            <Input
              min={0}
              max={5}
              type="number"
              value={manhwa.star_rating}
              onChange={(e) =>
                handleChange("star_rating", Number(e.target.value))
              }
            />
          </div>
          <div className="col-span-2">
            <Label className="mb-2">Notes</Label>
            <Textarea
              value={manhwa.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-4 w-full"
        >
          {loading ? "Adding..." : "Add Manhwa"}
        </Button>
      </SheetContent>
    </Sheet>
  );
};
