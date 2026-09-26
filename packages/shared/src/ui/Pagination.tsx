import { cn } from "../utils/cn";

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
      <button
        type="button"
        onClick={() => {
          onPageChange(page - 1);
        }}
        disabled={page <= 0}
        className="rounded-md px-3 py-1.5 text-sm text-night-700 hover:bg-night-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Précédent
      </button>
      <span className="text-sm text-night-600">
        Page {page + 1} / {totalPages}
      </span>
      <button
        type="button"
        onClick={() => {
          onPageChange(page + 1);
        }}
        disabled={page >= totalPages - 1}
        className={cn(
          "rounded-md px-3 py-1.5 text-sm text-night-700 hover:bg-night-50 disabled:cursor-not-allowed disabled:opacity-40",
        )}
      >
        Suivant
      </button>
    </nav>
  );
}
