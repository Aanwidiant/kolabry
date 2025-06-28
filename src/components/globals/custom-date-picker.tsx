import React from 'react';
import DatePicker, { ReactDatePickerCustomHeaderProps } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Chevron } from '@/components/icons';
import SingleSelect from '@/components/globals/single-select';

type CustomDatePickerProps = {
    selectedDate: Date | null;
    onChange: (date: Date | null) => void;
    placeholder?: string;
    id?: string;
    minDate?: Date;
    maxDate?: Date;
    disabled?: boolean;
    yearRange?: { start: number; end: number };
};

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
    selectedDate,
    onChange,
    placeholder = 'Select a date',
    id,
    minDate = new Date(new Date().setDate(new Date().getDate() + 1)),
    maxDate,
    disabled = false,
    yearRange,
}) => {
    const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];

    const currentYear = new Date().getFullYear();
    const startYear = yearRange?.start ?? currentYear - 10;
    const endYear = yearRange?.end ?? currentYear + 10;
    const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

    return (
        <DatePicker
            selected={selectedDate}
            onChange={onChange}
            placeholderText={placeholder}
            id={id}
            disabled={disabled}
            minDate={minDate}
            maxDate={maxDate}
            dateFormat='dd MMMM yyyy'
            renderCustomHeader={({
                date,
                changeYear,
                changeMonth,
                decreaseMonth,
                increaseMonth,
                prevMonthButtonDisabled,
                nextMonthButtonDisabled,
            }: ReactDatePickerCustomHeaderProps) => (
                <div className='flex items-center justify-between p-2 gap-2 rounded-t-lg'>
                    <button
                        onClick={decreaseMonth}
                        disabled={prevMonthButtonDisabled}
                        className={`p-1 rounded-md transition-colors duration-200 ${
                            prevMonthButtonDisabled
                                ? 'text-gray cursor-not-allowed'
                                : 'text-dark hover:bg-primary hover:text-light'
                        }`}
                    >
                        <Chevron className='w-5 h-5 rotate-180' />
                    </button>

                    <div className='flex sm:flex-row gap-2 h-14'>
                        <SingleSelect
                            value={months[date.getMonth()]}
                            onChange={(val) => {
                                if (typeof val === 'string') {
                                    changeMonth(months.indexOf(val));
                                }
                            }}
                            options={months.map((m) => ({ label: m, value: m }))}
                            placeholder='Select'
                            width='w-22 md:w-30'
                            allowClear={false}
                        />
                        <SingleSelect
                            value={date.getFullYear()}
                            onChange={(val) => {
                                if (typeof val === 'number') {
                                    changeYear(val);
                                }
                            }}
                            options={years.map((y) => ({ label: String(y), value: y }))}
                            placeholder='Select'
                            width='w-fit'
                            allowClear={false}
                        />
                    </div>

                    <button
                        onClick={increaseMonth}
                        disabled={nextMonthButtonDisabled}
                        className={`p-1 rounded-md transition-colors duration-200 ${
                            nextMonthButtonDisabled
                                ? 'text-gray cursor-not-allowed'
                                : 'text-dark hover:bg-primary hover:text-light'
                        }`}
                    >
                        <Chevron className='w-5 h-5' />
                    </button>
                </div>
            )}
            className='w-full input-style'
            wrapperClassName='w-full'
            calendarClassName='shadow-lg rounded-lg border border-dark'
            onKeyDown={(e) => {
                e.preventDefault();
            }}
        />
    );
};

export default CustomDatePicker;
