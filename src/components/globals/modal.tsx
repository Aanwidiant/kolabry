import React, { ReactNode } from 'react';
import clsx from 'clsx';
import { Close } from '@/components/icons';
import Button from '@/components/globals/button';

interface ModalProps {
    icon?: ReactNode;
    title?: string;
    children: ReactNode;
    footer?: ReactNode;
    onClose: () => void;
    className?: string;
}

export default function Modal({ icon, title, children, footer, onClose, className }: ModalProps) {
    return (
        <div className='fixed inset-0 z-30 flex items-center justify-center bg-black/75'>
            <div
                className={clsx(
                    'relative w-full max-w-2xl max-h-[90%] overflow-auto bg-white rounded-lg shadow-lg animate-fade-in m-4',
                    className
                )}
            >
                <div className='flex items-center justify-between px-6 pt-6'>
                    <div className='flex items-center gap-2'>
                        {icon && <div className='p-1 border border-gray-300 rounded-lg'>{icon}</div>}
                        {title && <h2 className='text-lg font-semibold'>{title}</h2>}
                    </div>
                    <button
                        onClick={onClose}
                        className='absolute right-3 top-3 rounded-full bg-gray/25 p-1 group hover:scale-105'
                    >
                        <Close className='h-5 w-5 fill-dark group-hover:scale-110' />
                    </button>
                </div>

                <div className='p-6'>{children}</div>

                {footer && (
                    <div className='sticky bottom-0 z-10 flex w-full justify-end border-t border-gray-200 bg-gray-100 px-6 py-3 gap-2'>
                        <Button onClick={onClose} variant='outline'>
                            Cancel
                        </Button>
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
