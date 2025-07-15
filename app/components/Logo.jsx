'use client'

export default function Logo({ size = 32, className = "" }) {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Logo SVG - Leica-inspired */}
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 40 40" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Outer frame - clean rectangular */}
        <rect 
          x="3" 
          y="3" 
          width="34" 
          height="34" 
          rx="2" 
          stroke="#27272a" 
          strokeWidth="1.5" 
          fill="#fafafa"
        />
        
        {/* Inner viewfinder frame */}
        <rect 
          x="8" 
          y="8" 
          width="24" 
          height="24" 
          rx="1" 
          stroke="#52525b" 
          strokeWidth="1" 
          fill="none"
        />
        
        {/* Lens aperture - simplified */}
        <circle 
          cx="20" 
          cy="20" 
          r="5" 
          stroke="#3f3f46" 
          strokeWidth="1.5" 
          fill="none"
        />
        
        {/* Center point */}
        <circle 
          cx="20" 
          cy="20" 
          r="1" 
          fill="#27272a"
        />
        
        {/* Minimal aperture indicators */}
        <line x1="20" y1="12" x2="20" y2="14" stroke="#71717a" strokeWidth="0.5" />
        <line x1="28" y1="20" x2="26" y2="20" stroke="#71717a" strokeWidth="0.5" />
        <line x1="20" y1="28" x2="20" y2="26" stroke="#71717a" strokeWidth="0.5" />
        <line x1="12" y1="20" x2="14" y2="20" stroke="#71717a" strokeWidth="0.5" />
      </svg>
      
      {/* Brand text - clean typography */}
      <div className="flex flex-col">
        <span className="font-semibold text-lg text-leica-800 tracking-tight">
          FrameTheGallery
        </span>
        <span className="text-xs text-leica-500 -mt-0.5 font-medium tracking-wide">
          PROFESSIONAL
        </span>
      </div>
    </div>
  )
}
