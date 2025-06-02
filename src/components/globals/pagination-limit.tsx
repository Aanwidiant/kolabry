import SingleSelect from './single-select';

interface PaginationLimitProps {
    label?: string;
    value: number;
    onChange: (value: string | number | null) => void;
}

export default function PaginationLimit({ label = 'Per Page', value, onChange }: PaginationLimitProps) {
    const options = [
        { label: '10', value: 10 },
        { label: '25', value: 25 },
        { label: '50', value: 50 },
        { label: '100', value: 100 },
    ];

    return (
        <SingleSelect
            label={label}
            options={options}
            value={value}
            onChange={onChange}
            allowClear={false}
            width='w-18'
        />
    );
}
