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
  DropdownMenuLabel,
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

type Manhwa = {
  id: string;
  title: string;
  originalTitle: string;
  author: string;
  status: "ongoing" | "hiatus" | "completed" | "dropped";
  genres: string[];
  totalChapters: number;
  currentChapter: number;
  readingStatus:
    | "reading"
    | "plan-to-read"
    | "completed"
    | "on-hold"
    | "dropped";
  rating: number;
  notes: string[];
};

const initialData: Manhwa[] = [
  {
    id: "1",
    title: "Solo Leveling",
    originalTitle: "나 혼자만 레벨업",
    author: "Chugong",
    status: "completed",
    genres: ["Action", "Fantasy"],
    totalChapters: 179,
    currentChapter: 179,
    readingStatus: "completed",
    rating: 5,
    notes: ["Amazing art!", "Loved the ending"],
  },
  {
    id: "2",
    title: "Tower of God",
    originalTitle: "신의 탑",
    author: "SIU",
    status: "ongoing",
    genres: ["Action", "Adventure", "Fantasy"],
    totalChapters: 600,
    currentChapter: 320,
    readingStatus: "reading",
    rating: 5,
    notes: ["Slow pacing sometimes"],
  },
  {
    id: "3",
    title: "Noblesse",
    originalTitle: "노블레스",
    author: "Son Jeho / Lee Kwangsu",
    status: "completed",
    genres: ["Action", "Supernatural"],
    totalChapters: 544,
    currentChapter: 120,
    readingStatus: "on-hold",
    rating: 4,
    notes: ["Dropped midway, but planning to resume"],
  },
  {
    id: "4",
    title: "Bastard",
    originalTitle: "바스타드",
    author: "Carnby Kim / Youngchan Hwang",
    status: "completed",
    genres: ["Thriller", "Psychological"],
    totalChapters: 93,
    currentChapter: 93,
    readingStatus: "completed",
    rating: 5,
    notes: ["Creepy but brilliant!", "One of the best thrillers"],
  },
  {
    id: "5",
    title: "Omniscient Reader’s Viewpoint",
    originalTitle: "전지적 독자 시점",
    author: "Sing-Shong",
    status: "ongoing",
    genres: ["Action", "Fantasy", "Psychological"],
    totalChapters: 120, // still ongoing
    currentChapter: 120,
    readingStatus: "reading",
    rating: 5,
    notes: ["Kim Dokja supremacy ✨", "Complex but amazing"],
  },
  {
    id: "6",
    title: "Sweet Home",
    originalTitle: "스위트 홈",
    author: "Carnby Kim / Youngchan Hwang",
    status: "completed",
    genres: ["Horror", "Drama", "Psychological"],
    totalChapters: 140,
    currentChapter: 60,
    readingStatus: "dropped",
    rating: 3,
    notes: ["Good start but didn’t vibe with later parts"],
  },
];

const ManhwaTable = () => {
  const [data, setData] = React.useState<Manhwa[]>(initialData);
  const [sorting, setSorting] = React.useState<SortingState>([]);
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

  const columns: ColumnDef<Manhwa>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      const title = row.getValue("title") as string;
      const truncated = title.length > 24 ? title.slice(0, 18) + "..." : title;
      return (
        <span>
          {truncated}
        </span>
      );
    },
  },
    {
      accessorKey: "originalTitle",
      header: "Original Title",
    },
    {
      accessorKey: "author",
      header: "Author",
    },
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
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.genres.map((g) => (
            <span
              key={g}
              className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground"
            >
              {g}
            </span>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "totalChapters",
      header: "Total Ch.",
    },
    {
      accessorKey: "currentChapter",
      header: "Current Ch.",
    },
    {
      accessorKey: "readingStatus",
      header: "Reading Status",
      cell: ({ row }) => (
        <span className="capitalize">{row.getValue("readingStatus")}</span>
      ),
    },
    {
      accessorKey: "rating",
      header: "Rating",
      cell: ({ row }) => "⭐".repeat(row.getValue("rating")),
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
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => alert(`Editing ${manhwa.title}`)}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => alert(`Delete ${manhwa.title}`)}>
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
  });

  const addNote = () => {
    if (!selectedManhwa || !newNote.trim()) return;
    setData((prev) =>
      prev.map((m) =>
        m.id === selectedManhwa.id ? { ...m, notes: [...m.notes, newNote] } : m
      )
    );
    setSelectedManhwa((prev) =>
      prev ? { ...prev, notes: [...prev.notes, newNote] } : prev
    );
    setNewNote("");
  };

  return (
    <div className="w-full font-mono">
      {/* Filter + Column Toggle */}
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter by title..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
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

      {/* Table */}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                  >
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                    >
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
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
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

      {/* Notes + Info Sheet */}
      <Sheet
        open={!!selectedManhwa}
        onOpenChange={(open) => !open && setSelectedManhwa(null)}
      >
        <SheetContent side="right" className="w-[700px]! min-w-md px-4">
          {selectedManhwa && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedManhwa.title}</SheetTitle>
                <SheetDescription>
                  {selectedManhwa.originalTitle} / {selectedManhwa.author}
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
                    {selectedManhwa.genres.join(", ")}
                  </div>
                  <div>
                    <span className="font-semibold">Total Chapters:</span>{" "}
                    {selectedManhwa.totalChapters}
                  </div>
                  <div>
                    <span className="font-semibold">Current Chapter:</span>{" "}
                    {selectedManhwa.currentChapter}
                  </div>
                  <div>
                    <span className="font-semibold">Reading Status:</span>{" "}
                    {selectedManhwa.readingStatus}
                  </div>
                  <div>
                    <span className="font-semibold">Rating:</span>{" "}
                    {"⭐".repeat(selectedManhwa.rating)}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold mb-2">Notes</h3>
                  {selectedManhwa.notes.length ? (
                    <ul className="list-disc pl-5">
                      {selectedManhwa.notes.map((note, i) => (
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
