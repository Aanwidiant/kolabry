import * as React from 'react';
import { SVGProps } from 'react';

const Chevron = (props: SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns='http://www.w3.org/2000/svg' fill='currentColor' viewBox='0 -960 960 960'>
        <path d='M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z' />
    </svg>
);
export default Chevron;
