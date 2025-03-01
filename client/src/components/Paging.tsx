import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { Post } from "./Posts";

export default function Paging({
  posts,
  postsPerPage,
  currentPage,
  setCurrentPage,
}: {
  posts: Post[];
  postsPerPage: number;
  currentPage: number;
  setCurrentPage: (currentPage: number) => void;
}) {
  const totalPages = Math.ceil(posts.length / postsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => handlePageChange(currentPage - 1)}
            className={
              currentPage === 1
                ? "opacity-50 pointer-events-none"
                : "cursor-pointer"
            }
          />
        </PaginationItem>
        <PaginationItem>
          <span className="px-4">
            Page {currentPage} of {totalPages}
          </span>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext
            onClick={() => handlePageChange(currentPage + 1)}
            className={
              currentPage === totalPages
                ? "opacity-50 pointer-events-none"
                : "cursor-pointer"
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
