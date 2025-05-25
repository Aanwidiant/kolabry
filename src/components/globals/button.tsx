'use client';
import { ReactNode, MouseEventHandler } from 'react';
import { useRouter } from 'next/navigation';
import BarLoader from './bar-loader';

interface ButtonProps {
    children: ReactNode;
    type?: 'button' | 'submit' | 'reset';
    onClick?: MouseEventHandler<HTMLButtonElement>;
    href?: string;
    disabled?: boolean;
    isLoading?: boolean;
}

export default function Button({
    children,
    type = 'button',
    onClick,
    href,
    disabled,
    isLoading = false,
}: ButtonProps) {
    const router = useRouter();
    const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
        if (onClick) onClick(e);
        if (disabled || isLoading) return;
        if (href) router.push(href);
    };

    return (
        <button
            type={type}
            onClick={handleClick}
            disabled={disabled || isLoading}
            className='group px-4 py-2 font-medium transition duration-300 ease-in-out bg-primary text-dark rounded-md hover:shadow-md hover:shadow-primary hover:text-light w-fit inline-flex items-center justify-center gap-x-2 disabled:cursor-not-allowed disabled:hover:shadow-none min-w-24 h-10 relative'
        >
            <span className={`${isLoading ? 'invisible' : 'visible'}`}>
                {children}
            </span>
            {isLoading && (
                <div className='absolute inset-0 flex items-center justify-center'>
                    <BarLoader scale={0.5} />
                </div>
            )}
        </button>
    );
}
