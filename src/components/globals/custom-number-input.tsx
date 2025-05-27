import { NumericFormat, NumericFormatProps } from 'react-number-format';

export default function CustomNumberInput(props: NumericFormatProps) {
    return (
        <NumericFormat
            {...props}
            className={`input-style no-arrow ${props.className ?? ''}`}
            thousandSeparator='.'
            decimalSeparator=','
            allowNegative={false}
        />
    );
}
