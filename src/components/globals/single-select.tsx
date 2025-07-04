import { useState, useEffect, useRef } from 'react';
import { Chevron, Close } from '@/components/icons';

interface SingleSelectProps {
    label?: string;
    options: { label: string; value: string | number }[];
    value: string | number | null;
    onChange: (value: string | number | null) => void;
    searchable?: boolean;
    placeholder?: string;
    width?: string;
    id?: string;
    allowClear?: boolean;
}

export default function SingleSelect({
    label,
    options,
    value,
    onChange,
    searchable = false,
    placeholder = 'Select an option.',
    width = 'w-64',
    allowClear = true,
    id,
}: SingleSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const filteredOptions = searchable
        ? options.filter((option) => option.label.toLowerCase().includes(query.toLowerCase()))
        : options;

    const selectedLabel = options.find((option) => option.value === value)?.label || placeholder;

    const handleSelect = (val: string | number) => {
        onChange(val);
        setIsOpen(false);
        setQuery('');
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`flex flex-col gap-2 ${width}`} ref={containerRef}>
            {label && <label className='label-style'>{label}</label>}
            <div className='relative'>
                <button
                    id={id}
                    type='button'
                    className='w-full input-style flex items-center justify-between'
                    onClick={() => setIsOpen((prev) => !prev)}
                >
                    <span>{selectedLabel}</span>
                    {allowClear && value !== null ? (
                        <Close
                            className='h-4 w-4 text-gray hover:text-error'
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange(null);
                                setIsOpen(false);
                            }}
                        />
                    ) : (
                        <Chevron
                            className={`h-5 w-5 text-gray transition-transform duration-200 ${
                                isOpen ? 'rotate-90' : 'rotate-270'
                            }`}
                        />
                    )}
                </button>

                {isOpen && (
                    <div className='absolute mt-1 w-full bg-light border border-gray rounded-md z-20 max-h-60 overflow-auto'>
                        {searchable && (
                            <input
                                type='text'
                                placeholder='Search...'
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className='w-full p-2 border-b outline-none text-sm'
                            />
                        )}
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.value}
                                    onClick={() => handleSelect(option.value)}
                                    className={`cursor-pointer text-end p-2 text-sm hover:bg-primary/50 hover:text-dark ${
                                        option.value === value ? 'bg-primary text-light' : ''
                                    }`}
                                >
                                    {option.label}
                                </div>
                            ))
                        ) : (
                            <div className='p-2 text-sm text-gray'>No result found.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
