import React, { useState } from 'react';
import { Search } from '@/components/icons';
import Button from '@/components/globals/button';

interface SearchInputProps {
    onSearch: (query: string) => void;
    search: string | null;
    widthInput?: string;
}

export default function SearchInput({
    onSearch,
    search,
    widthInput = 'w-56',
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
            <label htmlFor='search-input' className='label-style'>
                Search by {search}
            </label>
            <div className='flex gap-1 flex-wrap items-center'>
                <input
                    id='search-input'
                    className={`input-style ${widthInput}`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <Button onClick={handleSearch}>
                    <Search className='w-6 h-6' />
                </Button>
            </div>
        </div>
    );
}
