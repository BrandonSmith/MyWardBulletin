import React from 'react';
import { getHymnUrl, getHymnSlug } from '../data/hymns';

const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent);
const isAndroid = () => /Android/.test(navigator.userAgent);

interface Props {
  number: number;
  children?: React.ReactNode;
  className?: string;
}

const OpenHymnLink: React.FC<Props> = ({ number, children, className = "text-blue-700 underline hover:text-blue-900" }) => {
  const handleOpen = () => {
    const slug = getHymnSlug(number);
    const fallbackUrl = getHymnUrl(number);

    let appUrl: string;

    if (isIOS()) {
      // Gospel Library iOS: no known custom scheme — use universal link
      appUrl = fallbackUrl;
    } else if (isAndroid()) {
      // Try intent for Android Gospel Library
      appUrl = `intent://media/music/songs/${slug}?crumbs=hymns&lang=eng#Intent;scheme=https;package=org.lds.gospellibrary;end`;
    } else {
      window.open(fallbackUrl, '_blank');
      return;
    }

    const now = Date.now();

    // Try to open the app
    window.location.href = appUrl;

    // Fallback after timeout if app isn't installed
    setTimeout(() => {
      if (Date.now() - now < 1800) {
        window.location.href = fallbackUrl;
      }
    }, 1500);
  };

  return (
    <button
      onClick={handleOpen}
      className={className}
    >
      {children || `Open Hymn #${number}`}
    </button>
  );
};

export default OpenHymnLink; 