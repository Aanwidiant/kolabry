'use client';
import SingleSelect from './single-select';

interface PaginationLimitProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
}

export default function PaginationLimit({
    label = 'Tampilkan per halaman',
    value,
    onChange,
}: PaginationLimitProps) {
    const options = [
        { label: '10', value: '10' },
        { label: '25', value: '25' },
        { label: '50', value: '50' },
        { label: '100', value: '100' },
    ];

    return (
        <SingleSelect
            label={label}
            options={options}
            value={value}
            onChange={onChange}
            searchable={false}
            placeholder='Pilih limit...'
        />
    );
}
