'use client';
import { ReactNode, MouseEventHandler } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';

interface ButtonProps {
    children: ReactNode;
    type?: 'button' | 'submit' | 'reset';
    onClick?: MouseEventHandler<HTMLButtonElement>;
    href?: string;
    disabled?: boolean;
    variant?: 'default' | 'outline' | 'destructive';
    className?: string;
}

export default function Button({
    children,
    type = 'button',
    onClick,
    href,
    disabled = false,
    variant = 'default',
    className = '',
}: ButtonProps) {
    const router = useRouter();

    const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
        if (onClick) onClick(e);
        if (disabled) return;
        if (href) router.push(href);
    };

    const baseClasses =
        'px-4 py-2 text-sm font-medium rounded-md transition duration-300 inline-flex items-center justify-center gap-x-2 disabled:cursor-not-allowed disabled:opacity-50';

    const variantClasses = {
        default: 'bg-primary text-light hover:text-black hover:bg-primary/80 hover:shadow-md hover:shadow-primary/50',
        outline: 'border border-gray text-gray bg-light hover:text-dark hover:shadow-md hover:shadow-gray/50',
        destructive: 'bg-error text-light hover:text-dark/90 hover:bg-error/80 hover:shadow-md hover:shadow-error/50',
    };

    return (
        <button
            type={type}
            onClick={handleClick}
            disabled={disabled}
            className={clsx(baseClasses, variantClasses[variant], className)}
        >
            {children}
        </button>
    );
}
