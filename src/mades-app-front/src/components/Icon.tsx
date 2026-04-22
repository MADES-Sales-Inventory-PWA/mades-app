type IconProps = {
    size?: number | string;
    className?: string;
};

export const Icon = ({ size = 80, className }: IconProps) => {
    const dimension = typeof size === 'number' ? `${size}px` : size;

    return (
        <div
            className={`flex items-center justify-center rounded-full bg-[#E2E0EC] ${className || ''}`}
            style={{ width: dimension, height: dimension }}
        >
            <svg
                className="text-primary-blue"
                style={{ width: `calc(${dimension} * 0.6)`, height: `calc(${dimension} * 0.6)` }}
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <rect x="6" y="8" width="20" height="16" rx="3" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
                <line x1="6" y1="13" x2="26" y2="13" stroke="currentColor" strokeWidth="1.5" />
                <line x1="12" y1="18" x2="20" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M24 5 C28 8 28 12 25 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                <polyline points="25,14 27,10 23,10" fill="currentColor" stroke="none" />
            </svg>
        </div>
    );
};