type BarLoaderProps = {
    scale?: number;
};

export default function BarLoader({ scale = 1 }: BarLoaderProps) {
    const baseClass = 'bg-light w-3 h-8 animate-barLoader';
    const style = { transform: `scale(${scale})` };

    return (
        <div className='flex items-center justify-center space-x-2 inset-0' style={style}>
            <div className={baseClass} style={{ animationDelay: '0s' }} />
            <div className={baseClass} style={{ animationDelay: '0.16s' }} />
            <div className={baseClass} style={{ animationDelay: '0.32s' }} />
        </div>
    );
}
