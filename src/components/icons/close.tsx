import * as React from 'react';
import {SVGProps} from 'react';

const Close = (props: SVGProps<SVGSVGElement>) => (
    <svg
        {...props}
        xmlns='http://www.w3.org/2000/svg'
        fill='currentColor'
        viewBox="0 -960 960 960"
    >
        <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/>
    </svg>
);
export default Close;