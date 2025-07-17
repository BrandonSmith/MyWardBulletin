import React from 'react';

// Church bulletin logo: open book/bulletin with lines and a steeple/rays
export default function Logo({ size = 48 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="ZionBoard logo"
    >
      {/* Open book/bulletin */}
      <rect x="6" y="16" width="36" height="24" rx="6" fill="#F7C948" stroke="#1E3A8A" strokeWidth="2" />
      <rect x="10" y="20" width="12" height="16" rx="2" fill="#fff" stroke="#1E3A8A" strokeWidth="1.5" />
      <rect x="26" y="20" width="12" height="16" rx="2" fill="#fff" stroke="#1E3A8A" strokeWidth="1.5" />
      {/* Lines for text */}
      <rect x="13" y="24" width="6" height="1.5" rx="0.75" fill="#D1A545" />
      <rect x="13" y="28" width="6" height="1.5" rx="0.75" fill="#D1A545" />
      <rect x="29" y="24" width="6" height="1.5" rx="0.75" fill="#D1A545" />
      <rect x="29" y="28" width="6" height="1.5" rx="0.75" fill="#D1A545" />
      {/* Steeple/rays */}
      <rect x="22.5" y="10" width="3" height="8" rx="1.5" fill="#1E3A8A" />
      <path d="M24 10 L24 6" stroke="#F7C948" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 10 L20 8" stroke="#F7C948" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 10 L28 8" stroke="#F7C948" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
} 