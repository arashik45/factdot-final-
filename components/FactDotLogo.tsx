
import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

export const FactDotLogo: React.FC<LogoProps> = ({ size = 32, className = "" }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer Border Circle */}
      <circle 
        cx="50" 
        cy="50" 
        r="46" 
        stroke="currentColor" 
        strokeWidth="4" 
      />
      
      {/* Checkmark in the background */}
      <path 
        d="M28 45L45 62L75 28" 
        stroke="currentColor" 
        strokeWidth="10" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      
      {/* Magnifying Glass Head (Circle) */}
      <circle 
        cx="56" 
        cy="56" 
        r="16" 
        stroke="currentColor" 
        strokeWidth="6" 
        fill="white"
      />
      
      {/* Magnifying Glass Handle */}
      <path 
        d="M68 68L82 82" 
        stroke="currentColor" 
        strokeWidth="8" 
        strokeLinecap="round" 
      />
      
      {/* The Two Characteristic Dots */}
      <circle cx="38" cy="63" r="6" fill="#22c55e" /> {/* Green Dot */}
      <circle cx="56" cy="56" r="4" fill="#ef4444" /> {/* Red Dot inside glass */}
    </svg>
  );
};
