import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { ChevronDown, MoreHorizontal } from "lucide-react";

import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "./ui/sheet";

import { supabase } from "@/lib/supabase";
import { EditManhwaForm } from "./EditManhwaForm";

// Updated interface for snake_case columns
export interface Manhwa {
  id: string;
  manhwa_title: string;
  original_title: string;
  author: string;
  status: "ongoing" | "hiatus" | "completed" | "dropped";
  genres?: string[];
  star_rating?: number;
  total_chapters: number;
  current_chapter: number;
  reading_status:
    | "reading"
    | "plan-to-read"
    | "completed"
    | "on-hold"
    | "dropped";
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface ManhwaTableProps {
  data: Manhwa[];
  loading: boolean;
  refresh: () => void;
}

const ManhwaTable: React.FC<ManhwaTableProps> = ({
  data,
  refresh,
  loading,
}) => {
  const [error, setError] = React.useState<string | null>(null);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [editingManhwa, setEditingManhwa] = React.useState<Manhwa | null>(null);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [selectedManhwa, setSelectedManhwa] = React.useState<Manhwa | null>(
    null
  );
  const [newNote, setNewNote] = React.useState("");

  // add note Sheet
  const addNote = async () => {
    if (!selectedManhwa || !newNote.trim()) return;

    try {
      const updatedNotes = selectedManhwa.notes
        ? `${selectedManhwa.notes}\n${newNote}`
        : newNote;

      const { error } = await supabase
        .from("manhwa")
        .update({ notes: updatedNotes, updated_at: new Date().toISOString() })
        .eq("id", selectedManhwa.id);

      if (error) throw error;

      // Use refresh from props instead of setData
      refresh();
      setSelectedManhwa(null);
      setNewNote("");
    } catch (err) {
      console.error("[Error adding note]", err);
      setError(err instanceof Error ? err.message : "Error adding note");
    }
  };

  // Delete Manhwa
  const deleteManhwa = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const { error } = await supabase.from("manhwa").delete().eq("id", id);
      if (error) throw error;

      refresh(); // refresh table data
    } catch (err) {
      console.error("[Error deleting manhwa]", err);
      setError(err instanceof Error ? err.message : "Error deleting manhwa");
    }
  };

  // Table Columns
  const columns: ColumnDef<Manhwa>[] = [
    {
      accessorKey: "manhwa_title",
      header: "Title",
      cell: ({ row }) => {
        const title = row.getValue("manhwa_title") as string;
        const truncated =
          title.length > 24 ? title.slice(0, 18) + "..." : title;
        return <span>{truncated}</span>;
      },
    },
    { accessorKey: "original_title", header: "Original Title" },
    { accessorKey: "author", header: "Author" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span className="capitalize">{row.getValue("status")}</span>
      ),
    },
    {
      accessorKey: "genres",
      header: "Genres",
      cell: ({ row }) => {
        const genres = row.original.genres || [];
        return (
          <div className="flex flex-wrap gap-1">
            {genres.map((g) => (
              <span
                key={g}
                className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                {g}
              </span>
            ))}
          </div>
        );
      },
    },
    { accessorKey: "total_chapters", header: "Total Ch." },
    { accessorKey: "current_chapter", header: "Current Ch." },
    {
      accessorKey: "reading_status",
      header: "Reading Status",
      cell: ({ row }) => (
        <span className="capitalize">{row.getValue("reading_status")}</span>
      ),
    },
    {
      accessorKey: "star_rating",
      header: "Rating",
      cell: ({ row }) => "⭐".repeat(row.getValue("star_rating") || 0),
    },
    {
      id: "notes",
      header: "Notes",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedManhwa(row.original)}
        >
          Notes
        </Button>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      enableHiding: false,
      cell: ({ row }) => {
        const manhwa = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="space-y-2" align="end">
              <DropdownMenuItem
                className="bg-primary/50 text-white"
                onClick={() => setEditingManhwa(manhwa)}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="bg-destructive/50 text-white"
                onClick={() => deleteManhwa(manhwa.id, manhwa.manhwa_title)}
              >
                Delete
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSelectedManhwa(manhwa)}>
                Add note
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // TanStack React Table
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: 7, // show 7 rows per page
      },
    },
  });

  return (
    <div className="w-full font-mono">
      {/* Filter + Column Toggle */}
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter by title..."
          value={
            (table.getColumn("manhwa_title")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("manhwa_title")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Table */}
      <div className="overflow-hidden rounded-md scrollbar-thin scrollbar-thumb-muted scrollbar-track-background border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {loading ? (
              // Show skeleton rows
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_col, j) => (
                    <TableCell key={j}>
                      <div className="h-10 bg-secondary rounded animate-pulse w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      {/* Footer */}
      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>

        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>

      <Sheet
        open={!!editingManhwa}
        onOpenChange={(open) => !open && setEditingManhwa(null)}
      >
        <SheetContent side="right" className="w-[700px]! min-w-md px-4">
          <SheetHeader>
            <SheetTitle>Edit {editingManhwa?.manhwa_title}</SheetTitle>
          </SheetHeader>
          {editingManhwa && (
            <EditManhwaForm
              manhwa={editingManhwa}
              onClose={() => setEditingManhwa(null)}
              onUpdated={refresh}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Notes + Info Sheet */}
      <Sheet
        open={!!selectedManhwa}
        onOpenChange={(open) => !open && setSelectedManhwa(null)}
      >
        <SheetContent side="right" className="w-[700px]! min-w-md px-4">
          {selectedManhwa && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedManhwa.manhwa_title}</SheetTitle>
                <SheetDescription>
                  {selectedManhwa.original_title} / {selectedManhwa.author}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-4 ml-3 space-y-4">
                <div className="gap-2 text-sm">
                  <div>
                    <span className="font-semibold">Author:</span>{" "}
                    {selectedManhwa.author}
                  </div>
                  <div>
                    <span className="font-semibold">Status:</span>{" "}
                    {selectedManhwa.status}
                  </div>
                  <div>
                    <span className="font-semibold">Genres:</span>{" "}
                    {selectedManhwa.genres?.join(", ")}
                  </div>
                  <div>
                    <span className="font-semibold">Total Chapters:</span>{" "}
                    {selectedManhwa.total_chapters}
                  </div>
                  <div>
                    <span className="font-semibold">Current Chapter:</span>{" "}
                    {selectedManhwa.current_chapter}
                  </div>
                  <div>
                    <span className="font-semibold">Reading Status:</span>{" "}
                    {selectedManhwa.reading_status}
                  </div>
                  <div>
                    <span className="font-semibold">Rating:</span>{" "}
                    {"⭐".repeat(selectedManhwa.star_rating || 0)}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold mb-2">Notes</h3>
                  {selectedManhwa.notes ? (
                    <ul className="list-disc pl-5 whitespace-pre-line">
                      {selectedManhwa.notes.split("\n").map((note, i) => (
                        <li key={i}>{note}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No notes yet.
                    </p>
                  )}
                  <div className="mt-2 flex gap-2">
                    <Input
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add a new note..."
                    />
                    <Button onClick={addNote}>Add</Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ManhwaTable;
