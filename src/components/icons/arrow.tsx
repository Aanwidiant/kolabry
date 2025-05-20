import * as React from 'react';
import {SVGProps} from 'react';

const Arrow = (props: SVGProps<SVGSVGElement>) => (
    <svg
        {...props}
        xmlns='http://www.w3.org/2000/svg'
        fill='currentColor'
        viewBox="0 -960 960 960"
    >
        <path d="M647-440H160v-80h487L423-744l57-56 320 320-320 320-57-56 224-224Z"/>
    </svg>
);
export default Arrow;