import { FolderTree, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import { Field, FieldLabel } from "#/components/ui/field";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "#/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";

type Category = {
  id: number;
  name: string;
  icon: string;
};

interface CategoriesTableProps {
  categories: Category[];
  deleteCategoryAction: (formData: FormData) => Promise<void>;
}

type PageSizes = 5 | 10 | 20;
const PAGE_SIZE_OPTIONS: PageSizes[] = [5, 10, 20];

function getPageItems(currentPage: number, totalPages: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, "ellipsis", totalPages] as const;
  }

  if (currentPage >= totalPages - 2) {
    return [
      1,
      "ellipsis",
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ] as const;
  }

  return [
    1,
    "ellipsis",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis",
    totalPages,
  ] as const;
}

export function CategoriesTable({
  categories,
  deleteCategoryAction,
}: CategoriesTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSizes>(5);
  const totalPages = Math.max(1, Math.ceil(categories.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  if (categories.length === 0) {
    return (
      <Card className="w-full rounded-[28px] border border-dashed border-[var(--border-soft)] bg-[var(--surface-soft)] py-0 shadow-none">
        <CardContent className="flex flex-col items-center justify-center gap-4 px-8 py-14 text-center">
          <div className="flex size-16 items-center justify-center rounded-[1.5rem] bg-[var(--surface-muted)] text-[var(--text-soft)]">
            <FolderTree className="size-8" />
          </div>
          <h3 className="text-2xl font-semibold text-[var(--text-strong)]">
            No categories yet
          </h3>
          <p className="max-w-xl text-base text-[var(--text-soft)]">
            Create categories to group services and make the recurring spend map
            easier to scan.
          </p>
        </CardContent>
      </Card>
    );
  }

  const startIndex = (currentPage - 1) * pageSize;
  const visibleCategories = categories.slice(startIndex, startIndex + pageSize);
  const pageItems = getPageItems(currentPage, totalPages);
  let ellipsisCount = 0;

  return (
    <div className="w-full space-y-4">
      <div className="overflow-hidden rounded-[24px] border border-[var(--border-soft)] bg-white shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 border-b border-[var(--border-soft)] px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-soft)]">
          <span>Category</span>
          <span />
        </div>
        {visibleCategories.map((category) => (
          <div
            key={category.id}
            className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-[var(--border-soft)] px-5 py-4 transition-colors hover:bg-[var(--surface-tint)] not-last:border-b"
          >
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-[18px] bg-[rgba(231,111,81,0.12)] text-lg text-[var(--accent)]">
                {category.icon}
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-[var(--text-strong)]">
                  {category.name}
                </h3>
              </div>
            </div>

            <form action={deleteCategoryAction}>
              <input type="hidden" name="id" value={category.id} />
              <Button
                type="submit"
                variant="ghost"
                size="icon-sm"
                className="text-[var(--text-soft)] opacity-0 transition group-hover:opacity-100 hover:bg-[var(--surface-tint)] hover:text-[var(--text-strong)]"
              >
                <Trash2 className="size-3.5" />
                <span className="sr-only">Delete {category.name}</span>
              </Button>
            </form>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Field orientation="horizontal" className="w-fit gap-3">
          <FieldLabel htmlFor="select-category-rows-per-page">
            Rows per page
          </FieldLabel>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              setPageSize(Number(value) as PageSizes);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-20" id="select-category-rows-per-page">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start">
              <SelectGroup>
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        {totalPages > 1 ? (
          <Pagination className="mx-0 w-auto sm:ml-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#categories"
                  aria-disabled={currentPage === 1}
                  className={
                    currentPage === 1 ? "pointer-events-none opacity-50" : ""
                  }
                  onClick={(event) => {
                    event.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                />
              </PaginationItem>

              {pageItems.map((item) => {
                const key =
                  item === "ellipsis"
                    ? `ellipsis-${++ellipsisCount}`
                    : `page-${item}`;

                return (
                  <PaginationItem key={key}>
                    {item === "ellipsis" ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        href="#categories"
                        isActive={item === currentPage}
                        onClick={(event) => {
                          event.preventDefault();
                          setCurrentPage(item);
                        }}
                      >
                        {item}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  href="#categories"
                  aria-disabled={currentPage === totalPages}
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                  onClick={(event) => {
                    event.preventDefault();
                    if (currentPage < totalPages)
                      setCurrentPage(currentPage + 1);
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        ) : null}
      </div>
    </div>
  );
}
