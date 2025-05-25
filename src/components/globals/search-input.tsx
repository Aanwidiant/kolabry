'use client';
import React, { useState } from 'react';
import Button from './button';

interface SearchInputProps {
    onSearch: (query: string) => void;
    search: string | null;
    widthInput?: string;
    isLoading?: boolean;
}

export default function SearchInput({
    onSearch,
    search,
    widthInput = 'w-56',
    isLoading = false,
}: SearchInputProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = () => {
        onSearch(searchTerm);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className='flex flex-col gap-2'>
            <label
                htmlFor='search-input'
                className='text-sm font-medium text-gray-700'
            >
                Cari berdasarkan {search}
            </label>
            <div className='flex gap-2 flex-wrap items-center'>
                <input
                    id='search-input'
                    className={`border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${widthInput}`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                />
                <Button onClick={handleSearch} isLoading={isLoading}>
                    Cari
                </Button>
            </div>
        </div>
    );
}
