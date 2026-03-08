import Image from 'next/image';

export default function RiyalIcon({ width = 24, height = 24, className = "" }: { width?: number, height?: number, className?: string }) {
    // We use the uploaded image from public/riyal.png
    return (
        <span className={`inline-flex items-center justify-center ${className}`} style={{ verticalAlign: 'middle', display: 'inline-flex', padding: '0 4px' }}>
            <Image
                src="/riyal.png"
                alt="SAR"
                width={width}
                height={height}
                style={{ objectFit: 'contain' }}
            />
        </span>
    );
}
