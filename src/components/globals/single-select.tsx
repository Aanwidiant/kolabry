'use client';
import { useState, useEffect, useRef } from 'react';

interface SingleSelectProps {
    label: string;
    options: { label: string; value: string }[];
    value: string | null;
    onChange: (value: string) => void;
    searchable?: boolean;
    placeholder?: string;
}

export default function SingleSelect({
    label,
    options,
    value,
    onChange,
    searchable = false,
    placeholder = 'Pilih salah satu...',
}: SingleSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const filteredOptions = searchable
        ? options.filter((option) =>
              option.label.toLowerCase().includes(query.toLowerCase())
          )
        : options;

    const selectedLabel =
        options.find((option) => option.value === value)?.label || placeholder;

    const handleSelect = (val: string) => {
        onChange(val);
        setIsOpen(false);
        setQuery('');
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className='flex flex-col gap-2 w-64' ref={containerRef}>
            <label className='text-sm font-medium text-gray-700'>{label}</label>
            <div className='relative'>
                <button
                    type='button'
                    className='w-full border rounded-md px-4 py-2 text-left bg-white hover:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
                    onClick={() => setIsOpen((prev) => !prev)}
                >
                    {selectedLabel}
                </button>

                {isOpen && (
                    <div className='absolute mt-1 w-full bg-white border rounded-md shadow z-10 max-h-60 overflow-auto'>
                        {searchable && (
                            <input
                                type='text'
                                placeholder='Cari...'
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className='w-full px-3 py-2 border-b outline-none'
                            />
                        )}
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.value}
                                    onClick={() => handleSelect(option.value)}
                                    className={`cursor-pointer px-4 py-2 hover:bg-primary/10 ${
                                        option.value === value
                                            ? 'bg-primary text-white'
                                            : ''
                                    }`}
                                >
                                    {option.label}
                                </div>
                            ))
                        ) : (
                            <div className='px-4 py-2 text-sm text-gray-500'>
                                Tidak ada hasil
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
