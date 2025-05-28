import React from 'react';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

interface ActionButtonProps {
    icon: React.ReactNode;
    tooltipText: string;
    onClick?: (id?: number) => void;
    id?: number;
    tooltipId?: string;
}

export default function ActionButton({
    icon,
    tooltipText,
    onClick,
    id,
    tooltipId = 'action-button-tooltip',
}: ActionButtonProps) {
    const uniqueId = `${tooltipId}-${id ?? Math.random()}`;

    return (
        <>
            <button
                data-tooltip-id={uniqueId}
                data-tooltip-content={tooltipText}
                type='button'
                onClick={() => onClick?.(id)}
                className='group inline-flex items-center justify-center rounded-lg p-2 border border-gray hover:bg-primary hover:border-primary transition'
            >
                {icon}
            </button>
            <Tooltip id={uniqueId} />
        </>
    );
}
