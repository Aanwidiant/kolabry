import React from 'react';

interface PaginationProps {
    totalPages: number;
    currentPage: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({
    totalPages,
    currentPage,
    onPageChange,
}: PaginationProps) {
    const getPageNumbers = () => {
        if (totalPages <= 5) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        if (currentPage <= 3) {
            return [1, 2, 3, 4, '...', totalPages];
        }

        if (currentPage >= totalPages - 2) {
            return [
                1,
                '...',
                totalPages - 3,
                totalPages - 2,
                totalPages - 1,
                totalPages,
            ];
        }

        return [
            1,
            '...',
            currentPage - 1,
            currentPage,
            currentPage + 1,
            '...',
            totalPages,
        ];
    };

    return (
        <nav className='inline-flex items-center space-x-1 select-none'>
            {/* Previous Button */}
            <button
                onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md border ${
                    currentPage === 1
                        ? 'cursor-not-allowed text-gray-400 border-gray-300'
                        : 'hover:bg-primary hover:text-white border-gray-400'
                }`}
                aria-label='Previous page'
            >
                Prev
            </button>

            {/* Page Numbers */}
            {getPageNumbers().map((page, i) =>
                typeof page === 'number' ? (
                    <button
                        key={i}
                        onClick={() => onPageChange(page)}
                        aria-current={page === currentPage ? 'page' : undefined}
                        className={`px-3 py-1 rounded-md border ${
                            page === currentPage
                                ? 'bg-primary text-white border-primary'
                                : 'hover:bg-primary/20 border-gray-400'
                        }`}
                    >
                        {page}
                    </button>
                ) : (
                    <span
                        key={i}
                        className='px-3 py-1 text-gray-500 cursor-default select-none'
                    >
                        {page}
                    </span>
                )
            )}

            {/* Next Button */}
            <button
                onClick={() =>
                    onPageChange(Math.min(currentPage + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md border ${
                    currentPage === totalPages
                        ? 'cursor-not-allowed text-gray-400 border-gray-300'
                        : 'hover:bg-primary hover:text-white border-gray-400'
                }`}
                aria-label='Next page'
            >
                Next
            </button>
        </nav>
    );
}
