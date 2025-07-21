import React from 'react';

// Twemoji newspaper emoji logo (SVG from provided URL)
export default function Logo({ size = 48 }) {
  return (
    <img
      src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4f0.svg"
      alt="newspaper"
      style={{ width: size, height: size, display: 'inline-block', verticalAlign: 'middle' }}
    />
  );
} 