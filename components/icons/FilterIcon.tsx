
import React from 'react';

export const FilterIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    {...props}
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <circle cx="8" cy="5" r="3" />
    <circle cx="16" cy="19" r="3" />
    <path d="M8 8v13" />
    <path d="M16 16V3" />
  </svg>
);
