/**
 * yTera Brand Logo — Pure SVG Component
 * Usage: <YTeraLogo size={28} showSlogan={true} />
 */
export default function YTeraLogo({ size = 24, className = '', showSlogan = false, vertical = false }) {
    const scale = size / 24;

    return (
        <span className={className} style={{ 
            display: 'inline-flex', 
            flexDirection: 'column', 
            alignItems: vertical ? 'center' : 'flex-start', 
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
            gap: vertical ? `${12 * scale}px` : '0'
        }}>
            <div style={{ 
                display: 'inline-flex', 
                flexDirection: vertical ? 'column' : 'row',
                alignItems: 'center', 
                gap: vertical ? `${8 * scale}px` : `${8 * scale}px` 
            }}>
                {/* Custom SVG Icon - Minimalist "yT" / Infinity Book idea */}
                <svg 
                    width={size * 1.3} 
                    height={size * 1.3} 
                    viewBox="0 0 40 40" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FF5722" />
                            <stop offset="100%" stopColor="#EA580C" />
                        </linearGradient>
                    </defs>

                    {/* Background glow or subtle shape */}
                    <circle cx="20" cy="20" r="18" fill='rgba(255,87,34,0.03)' />
                    
                    {/* Infinity / Book Loop */}
                    <path 
                        d="M10 25C10 20 15 15 20 15C25 15 30 20 30 25C30 30 25 35 20 35C15 35 10 30 10 25Z" 
                        stroke="var(--text-primary)" 
                        strokeWidth="3.5" 
                        strokeLinecap="round" 
                        style={{ transition: 'stroke 0.3s ease' }}
                    />
                    <path 
                        d="M10 25C10 18 18 5 25 5C32 5 35 12 35 12" 
                        stroke="url(#logoGradient)" 
                        strokeWidth="3.5" 
                        strokeLinecap="round" 
                        opacity={0.9}
                    />
                    
                    {/* The "y" tail detail - Orange for Brand y */}
                    <path 
                        d="M20 15V25" 
                        stroke="url(#logoGradient)" 
                        strokeWidth="3.5" 
                        strokeLinecap="round" 
                        />

                    {/* Tiny Green Flourish (Eco-Touch) */}
                    <circle 
                        cx="34" 
                        cy="10" 
                        r="3" 
                        fill="#10B981" 
                    />
                </svg>

                {/* Wordmark */}
                <span style={{ 
                    fontWeight: 900, 
                    fontSize: `${size * 1.5}px`, 
                    letterSpacing: '-0.04em', 
                    lineHeight: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: vertical ? `${4 * scale}px` : '0'
                }}>
                    <span style={{ color: '#FF5722' }}>y</span>
                    <span style={{ color: 'var(--text-primary)', transition: 'color 0.3s ease' }}>Tera</span>
                </span>
            </div>
            
            {showSlogan && (
                <span style={{ 
                    fontSize: `${size * 0.42}px`, 
                    color: 'var(--text-secondary)', 
                    fontWeight: 500, 
                    marginTop: vertical ? '0' : '4px', 
                    marginLeft: vertical ? '0' : '2px',
                    letterSpacing: '0.02em',
                    transition: 'color 0.3s ease'
                }}>
                    Le savoir qui circule.
                </span>
            )}
        </span>
    );
}
